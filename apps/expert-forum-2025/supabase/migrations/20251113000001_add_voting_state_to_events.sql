-- Migration: Add voting state columns to events table
-- This adds is_votes_open and is_votes_lock flags to control voting flow
-- is_votes_open: Controls when participants can start voting
-- is_votes_lock: Locks voting permanently after finalization (results submitted)

-- Add is_votes_open column (default false - voting not open yet)
ALTER TABLE events
ADD COLUMN is_votes_open BOOLEAN NOT NULL DEFAULT false;

-- Add is_votes_lock column (default false - voting not locked yet)
ALTER TABLE events
ADD COLUMN is_votes_lock BOOLEAN NOT NULL DEFAULT false;

-- Add indexes for efficient queries
CREATE INDEX idx_events_is_votes_open ON events(is_votes_open);
CREATE INDEX idx_events_is_votes_lock ON events(is_votes_lock);

-- Add comment for documentation
COMMENT ON COLUMN events.is_votes_open IS 'Flag to control when participants can vote. When false, voting is not yet available.';
COMMENT ON COLUMN events.is_votes_lock IS 'Flag to permanently lock voting after results are finalized. When true, no more voting is allowed.';
