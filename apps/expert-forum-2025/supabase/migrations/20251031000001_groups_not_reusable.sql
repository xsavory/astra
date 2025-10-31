-- ==================== Expert Forum 2025 - Groups Not Reusable Migration ====================
-- Migration: 20251031000001_groups_not_reusable
-- Description: Make groups non-reusable - one group can only submit one ideation
--   Based on feedback: Groups are NOT reusable, must create new group for additional submissions
-- Date: 2025-10-31

-- ==================== STEP 1: Add Submission Tracking Back to Groups Table ====================

-- Add is_submitted column back to groups table
ALTER TABLE groups ADD COLUMN is_submitted BOOLEAN NOT NULL DEFAULT false;

-- Add submitted_at column back to groups table
ALTER TABLE groups ADD COLUMN submitted_at TIMESTAMPTZ;

-- Add constraint: submitted_at must be set when is_submitted is true
ALTER TABLE groups ADD CONSTRAINT submission_consistency CHECK (
  (is_submitted = false AND submitted_at IS NULL) OR
  (is_submitted = true AND submitted_at IS NOT NULL)
);

-- ==================== STEP 2: Backfill Existing Data ====================

-- Update existing groups that have ideation submissions
UPDATE groups g
SET
  is_submitted = true,
  submitted_at = i.submitted_at
FROM ideations i
WHERE
  i.group_id = g.id
  AND i.is_group = true
  AND g.is_submitted = false;

-- ==================== STEP 3: Create Index ====================

-- Create index for quick lookup of submitted groups
CREATE INDEX idx_groups_is_submitted ON groups(is_submitted) WHERE is_submitted = true;

-- ==================== STEP 4: Update Comments ====================

COMMENT ON COLUMN groups.is_submitted IS 'Indicates if this group has already submitted an ideation. Groups are NOT reusable after submission.';
COMMENT ON COLUMN groups.submitted_at IS 'Timestamp when the group submitted their ideation. Set automatically when ideation is submitted.';
COMMENT ON CONSTRAINT submission_consistency ON groups IS 'Ensures submitted_at is set when is_submitted is true, and NULL when false.';

-- ==================== Migration Complete ====================
-- Summary of changes:
-- 1. Added is_submitted and submitted_at columns back to groups table
-- 2. Added submission_consistency constraint
-- 3. Backfilled data for existing groups with ideation submissions
-- 4. Created index on is_submitted for performance
-- 5. Groups are now locked after one ideation submission
-- 6. To submit another ideation, participants must create a new group
