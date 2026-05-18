-- ============================================================
-- STEP 1: CHECK EXISTING RLS POLICIES ON profiles TABLE
-- Run this first and look at the output
-- ============================================================
SELECT 
  policyname, 
  cmd,        -- SELECT, INSERT, UPDATE, DELETE
  roles,
  qual        -- the USING() condition
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;


-- ============================================================
-- STEP 2: CHECK AUDITOR DATA - ARE THEIR region COLUMNS SET?
-- If region is NULL, the RM's filter was dropping them
-- ============================================================
SELECT 
  id, 
  officer_id, 
  full_name, 
  role, 
  region
FROM profiles
WHERE role = 'auditor'
ORDER BY full_name;


-- ============================================================
-- STEP 3: FIX - If any auditors have NULL region, set them
-- Taloja region auditors:
UPDATE profiles 
SET region = 'Taloja'
WHERE role = 'auditor' 
  AND officer_id IN ('AUD-01', 'AUD-03')
  AND (region IS NULL OR region = '');

-- Mahad region auditors:
UPDATE profiles 
SET region = 'Mahad'
WHERE role = 'auditor' 
  AND officer_id IN ('AUD-02', 'AUD-04')
  AND (region IS NULL OR region = '');


-- ============================================================
-- STEP 4: CRITICAL - Ensure Regional Managers CAN read 
-- all auditor profiles (not just their own region)
-- This is the most likely cause of auditors not showing up.
-- ============================================================

-- First check: does a "read all profiles" policy exist?
-- If regional_manager role is blocked by RLS, the query 
-- returns 0 rows even though data exists.

DROP POLICY IF EXISTS "Regional manager can view auditors" ON profiles;

CREATE POLICY "Regional manager can view auditors"
ON profiles
FOR SELECT
USING (
  -- Superadmins and regional managers can read all auditor profiles
  get_my_role() IN ('superadmin', 'regional_manager')
  OR
  -- Users can always read their own profile
  auth.uid() = id
);


-- ============================================================
-- STEP 5: VERIFY - After running above, re-check
-- ============================================================
SELECT 
  policyname, 
  cmd, 
  roles
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
