-- ==================== Expert Forum 2025 - Initial Data Seeding ====================
-- Migration: 20250129000004_seed_initial_data
-- Description: Insert initial/default data for the application
-- Date: 2025-01-29

-- ==================== Initial Event ====================
-- Insert default event for Expert Forum 2025
-- You can update the event details via admin dashboard later

INSERT INTO events (name, date, is_active, zoom_meeting_url)
VALUES ('Expert Forum 2025', '2025-10-27', false, NULL);

-- ==================== Notes ====================
-- Event can be activated via admin dashboard when ready
-- Zoom meeting URL can be added later
-- This ensures the application has at least one event to work with
