-- Fix RLS policy for group_members INSERT
-- Issue: Previous policy only allowed participants to add themselves
-- Solution: Allow group creators to add members to their groups during creation

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Participants can join groups" ON group_members;

-- Create new policy that allows:
-- 1. Participants to add themselves (self-join)
-- 2. Group creators to add members to their groups (during creation or invite)
CREATE POLICY "Participants can join groups or be invited by creators"
ON group_members
FOR INSERT
TO authenticated
WITH CHECK (
  (get_current_user_role() = 'participant'::user_role)
  AND (
    -- Allow participant to add themselves
    (participant_id = get_current_user_id())
    OR
    -- Allow group creator to add members to their group
    EXISTS (
      SELECT 1
      FROM groups
      WHERE groups.id = group_members.group_id
        AND groups.creator_id = get_current_user_id()
        AND groups.is_submitted = false  -- Only allow adding members if not submitted
    )
  )
);
