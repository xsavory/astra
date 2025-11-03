-- Fix RLS policy for group_members DELETE
-- Issue: Previous policy only allowed self-leave, but not creator removing members
-- Solution: Allow both self-leave AND creator removing members from their groups

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Participants can leave groups with restrictions" ON group_members;

-- Create new policy that allows:
-- 1. Members to leave group themselves (self-leave)
-- 2. Group creators to remove members from their groups (kick)
CREATE POLICY "Participants can leave groups or be removed by creators"
ON group_members
FOR DELETE
TO authenticated
USING (
  (get_current_user_role() = 'participant'::user_role)
  AND (
    -- Case 1: Self-leave - Member leaving group themselves
    -- Restrictions: Cannot be creator, group must not be submitted
    (
      participant_id = get_current_user_id()
      AND NOT EXISTS (
        SELECT 1 FROM groups
        WHERE groups.id = group_members.group_id
          AND groups.creator_id = get_current_user_id()
      )
      AND NOT EXISTS (
        SELECT 1 FROM groups
        WHERE groups.id = group_members.group_id
          AND groups.is_submitted = true
      )
    )
    OR
    -- Case 2: Creator removing members from their group
    -- Creator can remove any member except themselves, and only if not submitted
    (
      EXISTS (
        SELECT 1 FROM groups
        WHERE groups.id = group_members.group_id
          AND groups.creator_id = get_current_user_id()
          AND groups.is_submitted = false
      )
      AND participant_id != get_current_user_id()  -- Cannot remove self as creator
    )
  )
);
