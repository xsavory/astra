-- Migration: Create booth_votes_results table
-- This table stores the final snapshot of voting results when staff finalizes voting
-- Once results are submitted, is_votes_lock is set to true and no more votes are allowed

-- Create booth_votes_results table
CREATE TABLE booth_votes_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  booth_id UUID NOT NULL REFERENCES booths(id) ON DELETE CASCADE,
  final_vote_count INTEGER NOT NULL DEFAULT 0,
  final_rank INTEGER NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Ensure one result per booth per event
  UNIQUE(event_id, booth_id)
);

-- Add indexes for efficient queries
CREATE INDEX idx_booth_votes_results_event_id ON booth_votes_results(event_id);
CREATE INDEX idx_booth_votes_results_booth_id ON booth_votes_results(booth_id);
CREATE INDEX idx_booth_votes_results_final_rank ON booth_votes_results(final_rank);

-- Add comments for documentation
COMMENT ON TABLE booth_votes_results IS 'Final voting results snapshot submitted by staff. Immutable once created.';
COMMENT ON COLUMN booth_votes_results.final_vote_count IS 'Snapshot of vote count at the time of finalization';
COMMENT ON COLUMN booth_votes_results.final_rank IS 'Final ranking position (1-based)';
COMMENT ON COLUMN booth_votes_results.submitted_by IS 'Staff member who finalized the results';

-- Enable Row Level Security
ALTER TABLE booth_votes_results ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow staff and admin to read all results
CREATE POLICY "Staff and admin can view all results"
  ON booth_votes_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('staff', 'admin')
    )
  );

-- RLS Policy: Only staff and admin can insert results (via API only)
CREATE POLICY "Staff and admin can insert results"
  ON booth_votes_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('staff', 'admin')
    )
  );

-- RLS Policy: No updates allowed (results are immutable)
-- RLS Policy: No deletes allowed (results are immutable)
-- Note: Only admin can manually delete via database if absolutely necessary
