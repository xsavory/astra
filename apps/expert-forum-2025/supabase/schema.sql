-- ==================== Expert Forum 2025 - Database Schema ====================
-- PostgreSQL Schema for Supabase
-- Features: Proper foreign keys, constraints, indexes, triggers, and RLS

-- ==================== Enable Extensions ====================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== Enums ====================

CREATE TYPE user_role AS ENUM ('admin', 'staff', 'participant');
CREATE TYPE participant_type AS ENUM ('online', 'offline');
CREATE TYPE checkin_method AS ENUM ('qr', 'manual');

-- ==================== Tables ====================

-- Events Table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  zoom_meeting_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for active event lookup
CREATE INDEX idx_events_is_active ON events(is_active);

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE, -- Reference to Supabase Auth user
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'participant',
  participant_type participant_type,
  company VARCHAR(255),
  division VARCHAR(255),
  is_checked_in BOOLEAN NOT NULL DEFAULT false,
  is_eligible_to_draw BOOLEAN NOT NULL DEFAULT false,
  event_checkin_time TIMESTAMPTZ,
  event_checkin_method checkin_method,
  checked_in_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Staff who checked in
  group_id UUID, -- Will be foreign key to groups table (one-to-many)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT participant_type_required CHECK (
    (role != 'participant') OR (participant_type IS NOT NULL)
  ),
  CONSTRAINT checkin_time_method_consistency CHECK (
    (event_checkin_time IS NULL AND event_checkin_method IS NULL) OR
    (event_checkin_time IS NOT NULL AND event_checkin_method IS NOT NULL)
  )
);

-- Create indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_participant_type ON users(participant_type);
CREATE INDEX idx_users_is_checked_in ON users(is_checked_in);
CREATE INDEX idx_users_is_eligible_to_draw ON users(is_eligible_to_draw);
CREATE INDEX idx_users_group_id ON users(group_id);
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- Booths Table
CREATE TABLE booths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  poster_url TEXT,
  question_text TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
);

-- Create indexes for booths
CREATE INDEX idx_booths_order ON booths("order");
CREATE INDEX idx_booths_online_only ON booths(is_online_only);
CREATE INDEX idx_booths_offline_only ON booths(is_offline_only);

-- Booth Checkins Table (Many-to-Many: users ↔ booths)
CREATE TABLE booth_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booth_id UUID NOT NULL REFERENCES booths(id) ON DELETE CASCADE,
  answer TEXT,
  checkin_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint: One checkin per participant per booth
  UNIQUE(participant_id, booth_id)
);

-- Create indexes for booth_checkins
CREATE INDEX idx_booth_checkins_participant_id ON booth_checkins(participant_id);
CREATE INDEX idx_booth_checkins_booth_id ON booth_checkins(booth_id);
CREATE INDEX idx_booth_checkins_checkin_time ON booth_checkins(checkin_time);

-- Groups Table
-- Purpose: Group formation and member organization only
-- Ideation content is stored in ideations table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_submitted BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint: submitted_at must be set when is_submitted is true
  CONSTRAINT submission_consistency CHECK (
    (is_submitted = false AND submitted_at IS NULL) OR
    (is_submitted = true AND submitted_at IS NOT NULL)
  )
);

-- Create indexes for groups
CREATE INDEX idx_groups_creator_id ON groups(creator_id);
CREATE INDEX idx_groups_is_submitted ON groups(is_submitted);

-- Add foreign key for users.group_id (one-to-many relationship)
ALTER TABLE users
ADD CONSTRAINT fk_users_group_id
FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL;

-- Ideations Table
-- Purpose: Store ideation content (single source of truth)
-- For group ideations: link via group_id
-- For individual ideations: group_id is NULL
CREATE TABLE ideations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  company_case VARCHAR(255) NOT NULL,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL, -- NULL for individual ideations
  is_group BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint: group ideations must have group_id
  CONSTRAINT group_ideation_consistency CHECK (
    (is_group = false AND group_id IS NULL) OR
    (is_group = true AND group_id IS NOT NULL)
  )
);

-- Create indexes for ideations
CREATE INDEX idx_ideations_creator_id ON ideations(creator_id);
CREATE INDEX idx_ideations_group_id ON ideations(group_id);
CREATE INDEX idx_ideations_is_group ON ideations(is_group);

-- Draw Logs Table
CREATE TABLE draw_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Draw Winners Table (Many-to-Many: draw_logs ↔ users)
CREATE TABLE draw_winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_log_id UUID NOT NULL REFERENCES draw_logs(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint: Each participant can only appear once per draw
  UNIQUE(draw_log_id, participant_id)
);

-- Create indexes for draw_logs and draw_winners
CREATE INDEX idx_draw_logs_staff_id ON draw_logs(staff_id);
CREATE INDEX idx_draw_logs_created_at ON draw_logs(created_at);
CREATE INDEX idx_draw_winners_draw_log_id ON draw_winners(draw_log_id);
CREATE INDEX idx_draw_winners_participant_id ON draw_winners(participant_id);

-- ==================== Functions ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==================== Note: Business Logic Moved to API Layer ====================
-- Functions like calculate_eligibility, get_available_participants, and
-- get_group_member_count have been moved to the API layer for:
-- - Easier debugging and testing
-- - More flexible business logic changes
-- - Better error handling
-- - No database migrations needed for logic changes

-- ==================== Triggers ====================

-- Trigger to auto-update updated_at for all tables
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booths_updated_at BEFORE UPDATE ON booths
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ideations_updated_at BEFORE UPDATE ON ideations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: Business logic validations are now handled in API layer
-- - Eligibility calculation (booth completion thresholds)
-- - Group size validation (minimum 5 members)
-- - Available participants filtering
-- This allows for more flexible business logic and easier debugging

-- ==================== Views ====================

-- View for participant statistics
CREATE OR REPLACE VIEW participant_stats AS
SELECT
  COUNT(*) FILTER (WHERE role = 'participant') as total_participants,
  COUNT(*) FILTER (WHERE role = 'participant' AND participant_type = 'offline') as total_offline,
  COUNT(*) FILTER (WHERE role = 'participant' AND participant_type = 'online') as total_online,
  COUNT(*) FILTER (WHERE role = 'participant' AND is_checked_in = true) as total_checked_in,
  COUNT(*) FILTER (WHERE role = 'participant' AND is_checked_in = true AND participant_type = 'offline') as checked_in_offline,
  COUNT(*) FILTER (WHERE role = 'participant' AND is_checked_in = true AND participant_type = 'online') as checked_in_online,
  COUNT(*) FILTER (WHERE role = 'participant' AND is_eligible_to_draw = true) as total_eligible_for_draw
FROM users;

-- View for submission statistics
-- All ideations in the table are submitted (submitted_at is NOT NULL)
CREATE OR REPLACE VIEW submission_stats AS
SELECT
  COUNT(*) as total_submissions,
  COUNT(*) FILTER (WHERE is_group = true) as group_submissions,
  COUNT(*) FILTER (WHERE is_group = false) as individual_submissions
FROM ideations;

-- ==================== Initial Data ====================

-- Insert default event (you'll need to update this)
INSERT INTO events (name, date, is_active, zoom_meeting_url)
VALUES ('Expert Forum 2025', '2025-10-27', false, NULL);
