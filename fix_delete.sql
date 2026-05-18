-- Run this in Supabase SQL Editor to fix the Superadmin delete function

-- 1. Enable DELETE policy for Superadmins on the profiles table
DROP POLICY IF EXISTS "Superadmin can delete profiles" ON profiles;

CREATE POLICY "Superadmin can delete profiles" 
ON profiles 
FOR DELETE 
USING (get_my_role() = 'superadmin');

-- 2. NOTE: Deleting from the profiles table does NOT delete the user's password/email login 
-- from Supabase Authentication. To completely wipe a user, you must delete them from the 
-- "Authentication -> Users" page in the Supabase Dashboard. 
-- However, deleting their profile ensures they cannot log into the app since their role is gone.
