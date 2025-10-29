-- ==================== Expert Forum 2025 - Initial Functions Migration ====================
-- Migration: 20250129000001_initial_functions
-- Description: Create helper functions for RLS policies
-- Date: 2025-01-29

-- ==================== Helper Functions for RLS ====================

-- Function to get current user's ID from auth
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
  SELECT id FROM users WHERE auth_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to get current user's role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE auth_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM users WHERE auth_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if current user is staff
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
  SELECT role = 'staff' FROM users WHERE auth_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if current user is participant
CREATE OR REPLACE FUNCTION is_participant()
RETURNS BOOLEAN AS $$
  SELECT role = 'participant' FROM users WHERE auth_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ==================== Notes ====================
-- These functions are used by RLS policies to determine user permissions
-- SECURITY DEFINER allows the functions to run with elevated privileges
-- They connect Supabase Auth (auth.uid()) with our users table
