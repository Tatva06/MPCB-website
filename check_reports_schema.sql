-- Run this in Supabase SQL Editor to see the EXACT columns in your reports table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'reports'
ORDER BY ordinal_position;

-- Also check RLS policies on reports table
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'reports';

-- Check factory_assignments RLS
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'factory_assignments';
