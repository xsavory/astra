-- Migration: Fix Admin INSERT Policy for Users Table
--
-- Issue: Admin cannot insert new users due to RLS policy
-- Root Cause: The "Admin full access on users" policy uses get_current_user_role()
--             which returns NULL during INSERT because the new user record doesn't exist yet
--
-- Solution: Split the ALL policy into separate policies (SELECT, INSERT, UPDATE, DELETE)
--           For INSERT, check admin role directly from users table using auth.uid()

-- Drop the existing "Admin full access on users" policy
DROP POLICY IF EXISTS "Admin full access on users" ON users;

-- Create separate policies for better clarity and to fix INSERT issue

-- 1. Admin can SELECT all users
CREATE POLICY "Admin can select all users" ON users
  FOR SELECT
  TO authenticated
  USING (get_current_user_role() = 'admin');

-- 2. Admin can INSERT new users
-- For INSERT, we need to check the role from the users table directly using auth.uid()
-- because get_current_user_role() would return NULL (new user record doesn't exist yet)
CREATE POLICY "Admin can insert users" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role = 'admin'
    )
  );

-- 3. Admin can UPDATE all users
CREATE POLICY "Admin can update all users" ON users
  FOR UPDATE
  TO authenticated
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

-- 4. Admin can DELETE all users
CREATE POLICY "Admin can delete all users" ON users
  FOR DELETE
  TO authenticated
  USING (get_current_user_role() = 'admin');
