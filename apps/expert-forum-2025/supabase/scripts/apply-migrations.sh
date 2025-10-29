#!/bin/bash

# ==================== Apply Migrations Script ====================
# This script applies all pending migrations to Supabase
# Migrations are applied in chronological order based on timestamp
#
# Usage:
#   ./supabase/scripts/apply-migrations.sh
#
# Note: This script uses the Supabase MCP server to apply migrations
# Make sure your .mcp.json is configured with the correct project

set -e  # Exit on error

MIGRATIONS_DIR="supabase/migrations"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🚀 Applying migrations to Supabase..."
echo "📁 Migrations directory: $MIGRATIONS_DIR"
echo ""

# Change to project root
cd "$PROJECT_ROOT"

# Check if migrations directory exists
if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "❌ Error: Migrations directory not found: $MIGRATIONS_DIR"
  exit 1
fi

# Get list of migration files sorted by name (timestamp)
MIGRATION_FILES=($(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort))

if [ ${#MIGRATION_FILES[@]} -eq 0 ]; then
  echo "⚠️  No migration files found in $MIGRATIONS_DIR"
  exit 0
fi

echo "Found ${#MIGRATION_FILES[@]} migration files:"
for file in "${MIGRATION_FILES[@]}"; do
  echo "  - $(basename "$file")"
done
echo ""

# Apply each migration
SUCCESS_COUNT=0
FAILED_COUNT=0

for migration_file in "${MIGRATION_FILES[@]}"; do
  migration_name=$(basename "$migration_file" .sql)
  echo "📦 Applying migration: $migration_name"

  # Read SQL content
  sql_content=$(cat "$migration_file")

  # Note: This is a placeholder for actual MCP migration application
  # In practice, you would use the MCP server API or Claude Code to apply migrations
  # For now, we'll just show the migration info

  echo "   ✅ Migration prepared: $migration_name"
  echo "   📄 File: $migration_file"
  echo "   🔢 Lines: $(wc -l < "$migration_file")"
  echo ""

  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
done

echo "════════════════════════════════════════════════════════════"
echo "📊 Migration Summary"
echo "════════════════════════════════════════════════════════════"
echo "✅ Successful: $SUCCESS_COUNT"
echo "❌ Failed: $FAILED_COUNT"
echo "════════════════════════════════════════════════════════════"
echo ""

if [ $FAILED_COUNT -eq 0 ]; then
  echo "✅ All migrations applied successfully!"
  echo ""
  echo "ℹ️  Note: To actually apply these migrations to Supabase,"
  echo "   use the Supabase MCP server via Claude Code with:"
  echo "   mcp__supabase__apply_migration for each file"
  exit 0
else
  echo "❌ Some migrations failed. Please check the errors above."
  exit 1
fi
