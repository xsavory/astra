-- Add prize_name column to draw_winners table to track which specific prize each winner received
-- This is especially important for online draws where multiple different prizes are awarded simultaneously
ALTER TABLE draw_winners
ADD COLUMN prize_name VARCHAR(255);

-- Add comment for the new column
COMMENT ON COLUMN draw_winners.prize_name IS 'Name of the specific prize this winner received (e.g., "iPad 11 2025 128GB", "Xiaomi Google TV A 32 Pro")';
