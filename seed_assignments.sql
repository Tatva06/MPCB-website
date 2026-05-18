-- Paste this into your Supabase SQL Editor and run it!
-- This will create some dummy factory assignments and reports so your dashboards look populated.

-- 1. Create a dummy auditor (if you don't have one) or use an existing one
-- Find an auditor in your system to assign these to.
-- You can replace 'MPCB-AUD-01' with your actual auditor's officer_id if different.
DO $$
DECLARE
  v_auditor_id UUID;
  v_rm_id UUID;
BEGIN
  -- Get the first auditor and regional manager
  SELECT id INTO v_auditor_id FROM profiles WHERE role = 'auditor' LIMIT 1;
  SELECT id INTO v_rm_id FROM profiles WHERE role = 'regional_manager' LIMIT 1;

  IF v_auditor_id IS NULL OR v_rm_id IS NULL THEN
    RAISE NOTICE 'Skipping seed: Need at least 1 auditor and 1 regional manager in profiles.';
    RETURN;
  END IF;

  -- 2. Insert Fake Assignments
  INSERT INTO factory_assignments (
    factory_name, factory_id, region, assigned_to, assigned_by, assigned_officer_id, status, due_date, notes
  ) VALUES 
  ('Deepak Fertilizers', 'FAC-001', 'Taloja', v_auditor_id, v_rm_id, (SELECT officer_id FROM profiles WHERE id = v_auditor_id), 'pending', '2026-06-15', 'Check SO2 scrubber logs'),
  ('Aarti Industries', 'FAC-003', 'Taloja', v_auditor_id, v_rm_id, (SELECT officer_id FROM profiles WHERE id = v_auditor_id), 'in_progress', '2026-06-20', 'Routine Q3 inspection'),
  ('Reliance Industries', 'FAC-005', 'Taloja', v_auditor_id, v_rm_id, (SELECT officer_id FROM profiles WHERE id = v_auditor_id), 'completed', '2026-05-10', 'All good. No violations found.')
  ON CONFLICT DO NOTHING;

  -- 3. Insert Fake Reports
  INSERT INTO reports (
    factory_name, factory_id, region, submitted_by, auditor_id, status, risk_level, violations_count, findings
  ) VALUES
  ('Reliance Industries', 'FAC-005', 'Taloja', v_auditor_id, (SELECT officer_id FROM profiles WHERE id = v_auditor_id), 'COMPLIANT', 'LOW', 0, 'Inspected effluent treatment plant. Parameters within permissible limits. No tamper detected.')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed data successfully inserted!';
END $$;
