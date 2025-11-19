-- ==================== Migration: add_winner_to_ideations ====================
-- Migration: 20251119163923_add_winner_to_ideations
-- Description: Add winner selection capability to ideations table
-- Date: 2025-11-19
--
-- This migration adds the is_winner column to track which submissions
-- have been selected as winners by admins.
-- ==================================================================================

-- ==================== STEP 1: Add Column ====================
-- Add is_winner column to ideations table
ALTER TABLE ideations
ADD COLUMN is_winner BOOLEAN NOT NULL DEFAULT false;

-- ==================== STEP 2: Add Index ====================
-- Add index for efficient winner filtering
CREATE INDEX idx_ideations_is_winner ON ideations(is_winner);

-- ==================== STEP 3: Add Comments ====================
-- Add documentation comment
COMMENT ON COLUMN ideations.is_winner IS 'Flag to indicate if this submission has been selected as a winner by admin';
