-- Paste this into your Supabase SQL Editor and run it!
-- This populates the dashboards for AUD-01, AUD-02, and REG-01 with a lot of data.

DO $$
DECLARE
  v_reg_id UUID;
  v_aud1_id UUID;
  v_aud2_id UUID;
BEGIN
  -- 1. Find the user UUIDs for the specific officers
  SELECT id INTO v_reg_id FROM profiles WHERE officer_id = 'REG-01' LIMIT 1;
  SELECT id INTO v_aud1_id FROM profiles WHERE officer_id = 'AUD-01' LIMIT 1;
  SELECT id INTO v_aud2_id FROM profiles WHERE officer_id = 'AUD-02' LIMIT 1;

  IF v_reg_id IS NULL THEN RAISE EXCEPTION 'REG-01 profile not found! Please create it in the Admin Dashboard.'; END IF;
  IF v_aud1_id IS NULL THEN RAISE EXCEPTION 'AUD-01 profile not found! Please create it in the Admin Dashboard.'; END IF;
  IF v_aud2_id IS NULL THEN RAISE EXCEPTION 'AUD-02 profile not found! Please create it in the Admin Dashboard.'; END IF;

  -- Clear existing mock assignments to prevent duplicates
  DELETE FROM factory_assignments WHERE assigned_officer_id IN ('AUD-01', 'AUD-02');
  DELETE FROM reports WHERE auditor_id IN ('AUD-01', 'AUD-02');

  -- 2. Insert Fake Assignments for AUD-01
  INSERT INTO factory_assignments (factory_name, factory_id, region, assigned_to, assigned_by, assigned_officer_id, status, due_date, notes) VALUES 
  ('Deepak Fertilizers', 'FAC-001', 'Navi Mumbai', v_aud1_id, v_reg_id, 'AUD-01', 'pending', '2026-06-15', 'Check SO2 scrubber logs due to anomaly.'),
  ('Tata Power', 'FAC-002', 'Navi Mumbai', v_aud1_id, v_reg_id, 'AUD-01', 'in_progress', '2026-05-20', 'Routine Q2 inspection. Verify PM10 sensors.'),
  ('JSW Steel', 'FAC-005', 'Navi Mumbai', v_aud1_id, v_reg_id, 'AUD-01', 'completed', '2026-05-10', 'All good. No violations found.'),
  ('Larsen & Toubro', 'FAC-006', 'Navi Mumbai', v_aud1_id, v_reg_id, 'AUD-01', 'pending', '2026-06-25', 'Urgent check requested by citizen portal.'),
  ('Mahindra & Mahindra', 'FAC-007', 'Navi Mumbai', v_aud1_id, v_reg_id, 'AUD-01', 'in_progress', '2026-05-22', 'Check effluent discharge lines.'),
  ('Aarti Industries', 'FAC-008', 'Navi Mumbai', v_aud1_id, v_reg_id, 'AUD-01', 'pending', '2026-07-01', 'Chemical solvent audit.'),
  ('IG Petrochemicals', 'FAC-009', 'Navi Mumbai', v_aud1_id, v_reg_id, 'AUD-01', 'completed', '2026-04-15', 'Minor warning issued for VOC emissions.');

  -- 3. Insert Fake Assignments for AUD-02
  INSERT INTO factory_assignments (factory_name, factory_id, region, assigned_to, assigned_by, assigned_officer_id, status, due_date, notes) VALUES 
  ('Reliance Ind.', 'FAC-003', 'Navi Mumbai', v_aud2_id, v_reg_id, 'AUD-02', 'pending', '2026-06-18', 'Verify calibration logs.'),
  ('Hindalco', 'FAC-004', 'Navi Mumbai', v_aud2_id, v_reg_id, 'AUD-02', 'in_progress', '2026-05-25', 'Check night shift data gap.'),
  ('Taloja Copper', 'FAC-010', 'Navi Mumbai', v_aud2_id, v_reg_id, 'AUD-02', 'pending', '2026-06-30', 'Routine heavy metals audit.'),
  ('Pidilite Industries', 'FAC-011', 'Navi Mumbai', v_aud2_id, v_reg_id, 'AUD-02', 'completed', '2026-03-20', 'Compliant.'),
  ('Godrej Agrovet', 'FAC-012', 'Navi Mumbai', v_aud2_id, v_reg_id, 'AUD-02', 'completed', '2026-04-05', 'Compliant.'),
  ('Cipla Ltd', 'FAC-013', 'Navi Mumbai', v_aud2_id, v_reg_id, 'AUD-02', 'pending', '2026-07-10', 'Pharma waste disposal verification.');

  -- 4. Insert Fake Reports for Completed Assignments
  INSERT INTO reports (factory_name, factory_id, region, submitted_by, auditor_id, status, risk_level, violations_count, findings) VALUES
  ('JSW Steel', 'FAC-005', 'Navi Mumbai', v_aud1_id, 'AUD-01', 'COMPLIANT', 'LOW', 0, 'Inspected effluent treatment plant. Parameters within permissible limits. No tamper detected.'),
  ('IG Petrochemicals', 'FAC-009', 'Navi Mumbai', v_aud1_id, 'AUD-01', 'WARNING', 'MEDIUM', 1, 'VOC emissions slightly above limits. Issued warning notice to upgrade scrubbers within 30 days.'),
  ('Pidilite Industries', 'FAC-011', 'Navi Mumbai', v_aud2_id, 'AUD-02', 'COMPLIANT', 'LOW', 0, 'All systems functioning correctly.'),
  ('Godrej Agrovet', 'FAC-012', 'Navi Mumbai', v_aud2_id, 'AUD-02', 'COMPLIANT', 'LOW', 0, 'No issues found during physical audit.');

  RAISE NOTICE 'Seed data successfully inserted for AUD-01 and AUD-02!';
END $$;
