-- Migration: Booth Check-in Multiple Choice with Point System
-- Changes booth questions from essay to multiple-choice format
-- Replaces answer text with points and attempts tracking

-- ============================================
-- 1. Update booth_checkins table structure
-- ============================================

-- Add new columns for point system
ALTER TABLE booth_checkins
ADD COLUMN points INTEGER NOT NULL DEFAULT 0,
ADD COLUMN attempts INTEGER NOT NULL DEFAULT 1;

-- Drop old answer column
ALTER TABLE booth_checkins
DROP COLUMN answer;

-- Add index for potential points queries
CREATE INDEX idx_booth_checkins_points ON booth_checkins(points);

-- Add comment to document new structure
COMMENT ON COLUMN booth_checkins.points IS 'Points earned (10-100) based on attempts: 1st=100, 2nd=80, 3rd=60, 4th=40, 5th=20, 6+=10';
COMMENT ON COLUMN booth_checkins.attempts IS 'Number of attempts before correct answer (1-n)';

-- ============================================
-- 2. Update booths table - questions format
-- ============================================

-- Note: We don't need to alter the column type since JSONB can store any structure
-- The data migration will happen through reseeding (user will clear and reseed)
-- Add constraint to ensure questions array is not empty (already exists)
-- Add comment to document new question structure

COMMENT ON COLUMN booths.questions IS 'JSONB array of question objects with format: [{"question": "text", "options": ["A", "B", "C", "D"], "correct_answer": 0}]';

-- ============================================
-- 3. No data migration needed
-- ============================================

-- User will manually clear database and reseed with new format
-- This is acceptable since system is not yet in production
