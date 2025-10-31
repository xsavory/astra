-- ==================== Expert Forum 2025 - Requirement Changes Migration ====================
-- Migration: 20251031000000_requirement_changes
-- Description: Implement requirement changes based on client feedback
--   1. Participant passwords: Random generated (handled in seeding, no DB change)
--   2. Admin OTP login: Supabase Auth handles this, no DB change
--   3. Multiple booth questions: Change question_text to JSONB array
--   4. Group restructure: Junction table for many-to-many, remove group_id from users
--   5. Multiple ideations: Remove unique constraints, add company_case validation
-- Date: 2025-10-31

-- ==================== STEP 1: Create New Tables ====================

-- Group Members Junction Table (many-to-many relationship)
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint: Each participant can only be in a group once (but can rejoin)
  UNIQUE(group_id, participant_id)
);

-- Create indexes for group_members
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_participant_id ON group_members(participant_id);

-- ==================== STEP 2: Migrate Existing Data ====================

-- Migrate existing group memberships from users.group_id to group_members table
INSERT INTO group_members (group_id, participant_id, joined_at)
SELECT group_id, id, created_at
FROM users
WHERE group_id IS NOT NULL;

-- ==================== STEP 3: Update Existing Tables ====================

-- Drop foreign key constraint on users.group_id first
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_group_id;

-- Remove group_id column from users table (replaced by junction table)
ALTER TABLE users DROP COLUMN IF EXISTS group_id;

-- Update groups table: remove submission tracking (groups are now reusable)
ALTER TABLE groups DROP COLUMN IF EXISTS is_submitted;
ALTER TABLE groups DROP COLUMN IF EXISTS submitted_at;

-- Remove submission_consistency constraint from groups table
ALTER TABLE groups DROP CONSTRAINT IF EXISTS submission_consistency;

-- Update booths table: change question_text to JSONB questions array
-- Step 1: Add new column
ALTER TABLE booths ADD COLUMN questions JSONB;

-- Step 2: Migrate existing data (wrap single question in array)
UPDATE booths
SET questions = jsonb_build_array(question_text)
WHERE question_text IS NOT NULL;

-- Step 3: Set empty array for NULL questions
UPDATE booths
SET questions = '[]'::jsonb
WHERE questions IS NULL;

-- Step 4: Make questions NOT NULL and add constraint
ALTER TABLE booths ALTER COLUMN questions SET NOT NULL;
ALTER TABLE booths ADD CONSTRAINT questions_not_empty CHECK (jsonb_array_length(questions) > 0);

-- Step 5: Drop old question_text column
ALTER TABLE booths DROP COLUMN IF EXISTS question_text;

-- ==================== STEP 4: Update Ideations Table ====================

-- Remove unique constraint on creator_id if it exists (allow multiple submissions)
-- This constraint may not exist in the current schema, so we use IF EXISTS
DO $$
BEGIN
  -- Try to drop the constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ideations_creator_id_key'
    AND conrelid = 'ideations'::regclass
  ) THEN
    ALTER TABLE ideations DROP CONSTRAINT ideations_creator_id_key;
  END IF;
END $$;

-- Add partial unique constraint for online participants (creator_id, company_case)
-- This prevents the same participant from submitting the same company case twice
-- Only applies to individual ideations (is_group = false)
CREATE UNIQUE INDEX unique_online_company_case
ON ideations (creator_id, company_case)
WHERE is_group = false;

-- ==================== STEP 5: Update RLS Policies ====================

-- Drop existing policies for group_members if they exist (in case of re-running migration)
DROP POLICY IF EXISTS "Users can view all group members" ON group_members;
DROP POLICY IF EXISTS "Participants can join groups" ON group_members;
DROP POLICY IF EXISTS "Participants can leave groups" ON group_members;

-- Enable RLS on group_members
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_members table
CREATE POLICY "Users can view all group members"
ON group_members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Participants can join groups"
ON group_members FOR INSERT
TO authenticated
WITH CHECK (
  get_current_user_role() = 'participant' AND
  participant_id = get_current_user_id()
);

CREATE POLICY "Participants can leave groups"
ON group_members FOR DELETE
TO authenticated
USING (
  get_current_user_role() = 'participant' AND
  participant_id = get_current_user_id()
);

-- Admin full access on group_members
CREATE POLICY "Admin full access on group_members"
ON group_members FOR ALL
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- ==================== STEP 6: Update Triggers ====================

-- Trigger for group_members updated_at (if needed in future)
-- Currently not needed as group_members only has joined_at

-- ==================== STEP 7: Comments ====================

COMMENT ON TABLE group_members IS 'Junction table for many-to-many relationship between groups and participants. Allows participants to be in multiple groups over time.';
COMMENT ON COLUMN booths.questions IS 'Array of question strings stored as JSONB. Frontend randomly selects one question to display to participant.';
COMMENT ON INDEX unique_online_company_case IS 'Ensures online participants cannot submit the same company case twice for individual ideations.';

-- ==================== Migration Complete ====================
-- Summary of changes:
-- 1. Created group_members junction table for flexible group membership
-- 2. Migrated existing group_id data to group_members table
-- 3. Removed group_id column from users table
-- 4. Removed is_submitted and submitted_at from groups table (groups now reusable)
-- 5. Changed booths.question_text to booths.questions (JSONB array)
-- 6. Removed unique constraint on ideations.creator_id
-- 7. Added partial unique constraint on ideations (creator_id, company_case) for individual ideations
-- 8. Added RLS policies for group_members table
