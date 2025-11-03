# Admin Authentication Fix - Edge Functions Solution

## Problem
The admin dashboard was encountering "User not allowed" errors when trying to create or delete participants. This was caused by the client-side code attempting to use Supabase Admin API methods (`auth.admin.createUser()` and `auth.admin.deleteUser()`).

## Root Cause
The Supabase client in the browser was initialized with the **anon key** (`VITE_SUPABASE_ANON_KEY`), which does not have permission to use Admin API methods. Admin API methods require the **service role key**, which cannot be exposed in client-side code for security reasons.

## Solution
We moved the admin operations to server-side **Supabase Edge Functions** that have access to the service role key. This follows the secure pattern of keeping privileged operations on the server side.

## Implementation

### 1. Created Edge Functions

#### `admin-create-user`
- **Location**: `supabase/functions/admin-create-user/index.ts`
- **Purpose**: Creates new participant accounts (auth + database record)
- **Security**:
  - Verifies user is authenticated
  - Checks user has admin role
  - Uses service role key for auth.admin operations
- **Features**:
  - Creates auth account with default password
  - Creates database user record
  - Rollback on failure (deletes auth if DB insert fails)

#### `admin-delete-user`
- **Location**: `supabase/functions/admin-delete-user/index.ts`
- **Purpose**: Deletes participant accounts (database + auth)
- **Security**:
  - Verifies user is authenticated
  - Checks user has admin role
  - Validates participant is not checked in
- **Features**:
  - Prevents deletion if participant checked in
  - Deletes database record
  - Deletes auth account
  - Graceful handling if auth delete fails

#### Shared CORS Configuration
- **Location**: `supabase/functions/_shared/cors.ts`
- **Purpose**: Shared CORS headers for all Edge Functions

### 2. Updated Client API

Modified `src/lib/api/users.ts`:

**Before** (Client-side, using admin API directly):
```typescript
const { data: authData, error: authError } =
  await supabase.auth.admin.createUser({ ... })
```

**After** (Server-side via Edge Function):
```typescript
const { data: functionData, error: functionError } =
  await supabase.functions.invoke('admin-create-user', {
    body: { name, email, participant_type, company, division }
  })
```

### 3. Deployment Status
Both Edge Functions are deployed and active:
- ✅ `admin-create-user` - Active
- ✅ `admin-delete-user` - Active

## Benefits

1. **Security**: Service role key stays server-side
2. **Proper Architecture**: Admin operations isolated to server
3. **Maintainability**: Admin logic centralized in Edge Functions
4. **Flexibility**: Easy to add more admin operations as Edge Functions

## Testing

To test the fix:

1. Log in as admin user
2. Navigate to admin dashboard
3. Click "Add Participant"
4. Fill in participant details
5. Submit form
6. Verify participant is created successfully
7. Try deleting a non-checked-in participant
8. Verify deletion works

## Related Files

- `/supabase/functions/admin-create-user/index.ts` - Create user Edge Function
- `/supabase/functions/admin-delete-user/index.ts` - Delete user Edge Function
- `/supabase/functions/_shared/cors.ts` - Shared CORS config
- `/src/lib/api/users.ts` - Updated client API
- `/supabase/migrations/20251103000001_fix_admin_insert_users_policy.sql` - RLS policy fix (related but separate issue)

## Environment Variables

The Edge Functions use these environment variables (automatically available):
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations
- `PARTICIPANT_DEFAULT_PASSWORD` - Default password for new participants (optional, defaults to 'expertforum2025')

## Notes

- The RLS policies were also fixed separately to allow admin INSERT operations
- Edge Functions automatically have access to Supabase environment variables
- CORS is configured to allow requests from all origins (can be restricted if needed)
