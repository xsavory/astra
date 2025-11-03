-- ==================== Expert Forum 2025 - Fix Group Leave Validation ====================
-- Migration: 20251103000000_fix_group_leave_validation
-- Description: Add validation to prevent creator from leaving their own group
--   Business Rule Changes:
--   1. Creator CANNOT leave their own group (ever)
--   2. Non-creator members can only leave if group has NOT submitted
-- Date: 2025-11-03

-- ==================== STEP 1: Drop Old RLS Policy ====================

-- Remove the old policy that allows all participants to leave
DROP POLICY IF EXISTS "Participants can leave groups" ON group_members;

-- ==================== STEP 2: Create New Strict RLS Policy ====================

-- New policy with two additional validations:
-- 1. Prevent creator from leaving (check groups.creator_id)
-- 2. Prevent leaving submitted groups (check groups.is_submitted)
CREATE POLICY "Participants can leave groups with restrictions"
ON group_members FOR DELETE
TO authenticated
USING (
  -- Must be a participant
  get_current_user_role() = 'participant' AND
  -- Can only delete own membership
  participant_id = get_current_user_id() AND
  -- Prevent creator from leaving their own group
  NOT EXISTS (
    SELECT 1 FROM groups
    WHERE id = group_members.group_id
    AND creator_id = get_current_user_id()
  ) AND
  -- Prevent leaving submitted groups
  NOT EXISTS (
    SELECT 1 FROM groups
    WHERE id = group_members.group_id
    AND is_submitted = true
  )
);

-- ==================== STEP 3: Update Comments ====================

COMMENT ON POLICY "Participants can leave groups with restrictions" ON group_members IS
'Allows non-creator participants to leave groups only if the group has not submitted an ideation. Creator cannot leave their own group.';

-- ==================== Migration Complete ====================
-- Summary of changes:
-- 1. Dropped old "Participants can leave groups" policy
-- 2. Created new strict policy with creator and submission checks
-- 3. Database-level enforcement - cannot be bypassed via API or direct client access
--
-- Security Benefits:
-- - RLS enforced at PostgreSQL level (most secure layer)
-- - Prevents creator from leaving via any method (API, direct Supabase client, etc.)
-- - Prevents leaving submitted groups to maintain data integrity
--
-- Testing:
-- - Creator should get permission denied when trying to leave
-- - Non-creator can leave only if group.is_submitted = false
-- - Non-creator gets permission denied if group.is_submitted = true
