-- ==================== Expert Forum 2025 - Initial RLS Policies ====================
-- Migration: 20250129000002_initial_rls
-- Description: Enable RLS and create policies for all tables
-- Date: 2025-01-29
-- Principle: Admin = full access, Staff = limited, Participant = own data

-- ==================== Enable RLS ====================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE booths ENABLE ROW LEVEL SECURITY;
ALTER TABLE booth_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideations ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_winners ENABLE ROW LEVEL SECURITY;

-- ==================== Events Table ====================
-- Admin: full access
-- Staff and Participants: read-only

CREATE POLICY "Admin full access on events"
ON events FOR ALL
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Anyone authenticated can view events"
ON events FOR SELECT
TO authenticated
USING (true);

-- ==================== Users Table ====================
-- Admin: full access
-- Staff: can view all participants (for checkin/helpdesk)
-- Participant: can view all participants (for group invites)

CREATE POLICY "Admin full access on users"
ON users FOR ALL
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Staff can view and update participants"
ON users FOR SELECT
TO authenticated
USING (
  get_current_user_role() = 'staff' OR
  get_current_user_role() = 'participant'
);

CREATE POLICY "Staff can update participants for checkin"
ON users FOR UPDATE
TO authenticated
USING (get_current_user_role() = 'staff')
WITH CHECK (get_current_user_role() = 'staff');

-- ==================== Booths Table ====================
-- Everyone can read, only admin can modify

CREATE POLICY "Anyone authenticated can view booths"
ON booths FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin full access on booths"
ON booths FOR ALL
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- ==================== Booth Checkins Table ====================
-- Everyone can read their own, participants can insert their own

CREATE POLICY "Users can view all booth checkins"
ON booth_checkins FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Participants can insert own booth checkins"
ON booth_checkins FOR INSERT
TO authenticated
WITH CHECK (
  get_current_user_role() = 'participant' AND
  participant_id = get_current_user_id()
);

-- ==================== Groups Table ====================
-- Everyone can read, participants can create/update their own

CREATE POLICY "Users can view all groups"
ON groups FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Participants can create groups"
ON groups FOR INSERT
TO authenticated
WITH CHECK (
  get_current_user_role() = 'participant' AND
  creator_id = get_current_user_id()
);

CREATE POLICY "Creators can update own groups"
ON groups FOR UPDATE
TO authenticated
USING (
  get_current_user_role() = 'participant' AND
  creator_id = get_current_user_id()
)
WITH CHECK (
  get_current_user_role() = 'participant' AND
  creator_id = get_current_user_id()
);

-- ==================== Ideations Table ====================
-- Everyone can read, participants can create their own

CREATE POLICY "Users can view all ideations"
ON ideations FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Participants can insert own ideations"
ON ideations FOR INSERT
TO authenticated
WITH CHECK (
  get_current_user_role() = 'participant' AND
  creator_id = get_current_user_id()
);

-- ==================== Draw Logs Table ====================
-- Everyone can read, staff/admin can create

CREATE POLICY "Users can view all draw logs"
ON draw_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Staff can insert draw logs"
ON draw_logs FOR INSERT
TO authenticated
WITH CHECK (
  get_current_user_role() = 'staff' OR
  get_current_user_role() = 'admin'
);

-- ==================== Draw Winners Table ====================
-- Everyone can read, staff/admin can create

CREATE POLICY "Users can view all draw winners"
ON draw_winners FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Staff can insert draw winners"
ON draw_winners FOR INSERT
TO authenticated
WITH CHECK (
  get_current_user_role() = 'staff' OR
  get_current_user_role() = 'admin'
);

-- ==================== Notes ====================
-- This simplified approach:
-- 1. Admin has full access to everything
-- 2. Staff has limited access for their workflows (checkin, draw, helpdesk)
-- 3. Participants can read most data (needed for group invites, viewing submissions)
-- 4. Participants can only write their own data
-- 5. Business logic validation happens in API layer, not RLS
