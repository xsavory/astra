-- ==================== Expert Forum 2025 - Initial Views Migration ====================
-- Migration: 20250129000003_initial_views
-- Description: Create statistics views for admin dashboard
-- Date: 2025-01-29

-- ==================== Participant Statistics View ====================
-- Pre-calculated statistics for participant metrics
-- Used by admin dashboard

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

-- ==================== Submission Statistics View ====================
-- Pre-calculated statistics for ideation submissions
-- Used by admin dashboard

CREATE OR REPLACE VIEW submission_stats AS
SELECT
  COUNT(*) as total_submissions,
  COUNT(*) FILTER (WHERE is_group = true) as group_submissions,
  COUNT(*) FILTER (WHERE is_group = false) as individual_submissions
FROM ideations;

-- ==================== Notes ====================
-- These views provide fast read access to statistics
-- They automatically update as underlying data changes
-- Used by admin dashboard for real-time metrics
