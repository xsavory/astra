-- Migration: Add RLS policy for participant self check-in
-- Date: 2025-10-31
-- Description: Allow online participants to update their own check-in status

-- Drop policy if exists (for idempotency)
DROP POLICY IF EXISTS "Participants can self check-in" ON users;

-- Create policy: Allow participants to check-in themselves
-- This enables online participants to call checkinEvent('manual') for self check-in
CREATE POLICY "Participants can self check-in"
ON users
FOR UPDATE
TO authenticated
USING (
  -- Only allow updating own record
  auth.uid() = auth_id AND
  get_current_user_role() = 'participant'
)
WITH CHECK (
  -- Only allow updating own record
  auth.uid() = auth_id AND
  get_current_user_role() = 'participant'
);

-- Verification query (optional - comment out if not needed)
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'users'
-- ORDER BY policyname;
