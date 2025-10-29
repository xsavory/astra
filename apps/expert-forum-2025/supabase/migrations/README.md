# Database Migrations

This directory contains timestamped SQL migrations for the Expert Forum 2025 database.

## Migration Structure

```
migrations/
├── 20250129000000_initial_schema.sql          # Tables, enums, indexes, constraints
├── 20250129000001_initial_functions.sql       # Helper functions for RLS
├── 20250129000002_initial_rls.sql            # Row Level Security policies
├── 20250129000003_initial_views.sql          # Statistics views
├── 20250129000004_seed_initial_data.sql      # Initial event data
└── README.md                                  # This file
```

## Migration Naming Convention

**Format:** `YYYYMMDDHHMMSS_description.sql`

- **Timestamp**: YYYYMMDDhhmmss (year, month, day, hour, minute, second)
- **Description**: snake_case description of the change
- **Extension**: `.sql`

**Examples:**
```
20250129000000_initial_schema.sql
20250130120000_add_booth_filters.sql
20250201093000_add_user_phone_number.sql
20250215154500_alter_ideations_add_attachment.sql
```

### Description Prefixes

Use these standard prefixes for clarity:

- `create_` - Creating new tables/views/functions
- `alter_` - Modifying existing structures
- `add_` - Adding columns/constraints/indexes
- `remove_` - Removing columns/constraints/indexes
- `drop_` - Dropping tables/views/functions
- `update_` - Updating data
- `seed_` - Seeding initial/test data

## Creating New Migrations

### 1. Generate Timestamp

```bash
# Linux/macOS
date +"%Y%m%d%H%M%S"

# Output example: 20250130120530
```

### 2. Create Migration File

```bash
# Template
touch supabase/migrations/TIMESTAMP_description.sql

# Example
touch supabase/migrations/20250130120530_add_booth_filters.sql
```

### 3. Write Migration SQL

```sql
-- ==================== Description ====================
-- Migration: TIMESTAMP_description
-- Description: Clear description of what this migration does
-- Date: YYYY-MM-DD

-- Your SQL here
ALTER TABLE booths ADD COLUMN is_online_only BOOLEAN DEFAULT false;
ALTER TABLE booths ADD COLUMN is_offline_only BOOLEAN DEFAULT false;

CREATE INDEX idx_booths_online_only ON booths(is_online_only);
CREATE INDEX idx_booths_offline_only ON booths(is_offline_only);
```

## Applying Migrations

### Using MCP Supabase Server (Recommended)

Apply migrations one by one via Claude Code:

```
mcp__supabase__apply_migration with:
- name: "add_booth_filters"
- query: <contents of your migration file>
```

### Using Script

```bash
# List all migrations
ls -1 supabase/migrations/*.sql

# The apply-migrations.sh script shows migration info
# For actual application, use MCP server
./supabase/scripts/apply-migrations.sh
```

## Migration Best Practices

### 1. **Make Migrations Idempotent**

Use `IF NOT EXISTS` / `IF EXISTS` where possible:

```sql
-- Good
CREATE TABLE IF NOT EXISTS my_table (...);
ALTER TABLE my_table ADD COLUMN IF NOT EXISTS new_column TEXT;
DROP TABLE IF EXISTS old_table;

-- Avoid
CREATE TABLE my_table (...);  -- Will fail if table exists
```

### 2. **One Purpose Per Migration**

Each migration should do one logical thing:

```sql
-- Good: Separate migrations
20250130120000_add_booth_filters.sql
20250130120100_add_user_phone.sql

-- Avoid: Everything in one file
20250130120000_add_multiple_features.sql
```

### 3. **Test Locally First**

Before applying to production:

1. Test on development database
2. Verify data integrity
3. Check query performance
4. Test rollback if needed

### 4. **Document Changes**

Add comments explaining WHY, not just WHAT:

```sql
-- Add phone number for SMS notifications
-- Requested by: Product team
-- Ticket: EF-123
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
```

### 5. **Handle Data Migrations Carefully**

```sql
-- Bad: Direct data update
UPDATE users SET status = 'active';

-- Good: Conditional update with safety check
UPDATE users
SET status = 'active'
WHERE status IS NULL
  AND created_at >= '2025-01-01';
```

### 6. **Add Indexes for New Queries**

If your migration adds queryable columns:

```sql
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
CREATE INDEX idx_users_phone_number ON users(phone_number)
WHERE phone_number IS NOT NULL;  -- Partial index for better performance
```

## Rollback Strategy

### For Most Changes

Create a new migration that reverses the change:

```sql
-- Original: 20250130120000_add_booth_filters.sql
ALTER TABLE booths ADD COLUMN is_online_only BOOLEAN DEFAULT false;

-- Rollback: 20250130130000_remove_booth_filters.sql
ALTER TABLE booths DROP COLUMN IF EXISTS is_online_only;
```

### For Critical Production Issues

1. **Quick rollback via SQL**:
   ```sql
   -- Direct SQL in Supabase SQL Editor
   ALTER TABLE booths DROP COLUMN is_online_only;
   ```

2. **Create rollback migration immediately after**

3. **Document the incident**

## Checking Migration Status

### View Applied Migrations

Currently no automated tracking. Future enhancement will add:

```sql
CREATE TABLE schema_migrations (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Manual Check

Compare migration files with actual database schema:

```sql
-- Check if table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'your_table';

-- Check if column exists
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'your_table';
```

## Common Migration Patterns

### Adding a New Table

```sql
CREATE TABLE IF NOT EXISTS new_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_new_table_name ON new_table(name);

CREATE TRIGGER update_new_table_updated_at
BEFORE UPDATE ON new_table
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Adding a Column with Default

```sql
-- Add column with temporary default
ALTER TABLE users
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';

-- Update existing rows if needed
UPDATE users SET status = 'active' WHERE is_checked_in = true;

-- Remove default if not needed permanently
ALTER TABLE users ALTER COLUMN status DROP DEFAULT;
```

### Adding a Foreign Key

```sql
-- Add column first
ALTER TABLE users ADD COLUMN IF NOT EXISTS team_id UUID;

-- Add foreign key constraint
ALTER TABLE users
ADD CONSTRAINT fk_users_team_id
FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- Add index for foreign key
CREATE INDEX idx_users_team_id ON users(team_id);
```

### Modifying Enum

```sql
-- Can't modify enum directly, need to:

-- 1. Add new enum
CREATE TYPE new_user_role AS ENUM ('admin', 'staff', 'participant', 'moderator');

-- 2. Add temporary column
ALTER TABLE users ADD COLUMN new_role new_user_role;

-- 3. Copy data
UPDATE users SET new_role = role::text::new_user_role;

-- 4. Drop old column
ALTER TABLE users DROP COLUMN role;

-- 5. Rename new column
ALTER TABLE users RENAME COLUMN new_role TO role;

-- 6. Drop old enum
DROP TYPE user_role;

-- 7. Rename new enum
ALTER TYPE new_user_role RENAME TO user_role;
```

## Troubleshooting

### Migration Failed to Apply

1. **Check error message** - Usually indicates the problem
2. **Check current database state** - Might be partially applied
3. **Fix the issue** - Update migration or fix database
4. **Apply again** or **rollback and retry**

### Migration Applied Twice

- If using `IF NOT EXISTS`, should be safe
- If not, manually fix database state
- Create rollback migration

### Production Data Lost

- **Never delete data in migrations**
- Always use soft deletes or archive tables
- Keep backups

## Getting Help

- **Documentation**: See main README.md in project root
- **Database Schema**: See `schema.sql` for complete schema
- **RLS Policies**: See `rls-policies.sql` for security policies
- **Supabase Docs**: https://supabase.com/docs/guides/database

## Related Files

- `../scripts/seed-participants.ts` - Bulk participant seeding
- `../csv/participants_sample.csv` - CSV template for seeding
- `../seed/` - Development seed data
- `../_archive/` - Archived old schema files
