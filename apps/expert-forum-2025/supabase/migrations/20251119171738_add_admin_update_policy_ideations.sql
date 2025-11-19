-- ==================== Migration: add_admin_update_policy_ideations ====================
-- Migration: 20251119171738_add_admin_update_policy_ideations
-- Description: Add RLS policy to allow admins to update ideations (for winner selection)
-- Date: 2025-11-19
--
-- This migration adds UPDATE policy for admins to update ideations table,
-- specifically to allow setting is_winner flag for winner selection feature.
-- ==================================================================================

-- ==================== STEP 1: Add Admin Update Policy ====================
-- Allow admins to update any ideation (for winner selection)
CREATE POLICY "Admin can update ideations"
ON ideations FOR UPDATE
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');
