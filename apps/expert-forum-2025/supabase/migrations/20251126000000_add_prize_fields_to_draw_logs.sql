-- Add participant_type and prize_category fields to draw_logs table
ALTER TABLE draw_logs
ADD COLUMN participant_type participant_type,
ADD COLUMN prize_category VARCHAR(50);

-- Add comment for the new columns
COMMENT ON COLUMN draw_logs.participant_type IS 'Type of participant for this draw (online/offline)';
COMMENT ON COLUMN draw_logs.prize_category IS 'Category of prize (grand/major/minor)';
