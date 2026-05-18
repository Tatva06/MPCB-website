import { Alert, FactoryLeaderboard, Fingerprint, MetricData, ShapData } from '../types';

export const mockAlerts: Alert[] = [
  {
    id: 'ALT-2025-0318',
    factory: 'Deepak Fertilizers',
    cluster: 'Taloja MIDC',
    type: 'Zero Variance Flatline',
    detail: 'SO₂ standard deviation < 0.01 for 6.2 consecutive hours. Value locked at 140 ppm (legal limit: 100 ppm). High probability of DAHS software manipulation.',
    severity: 'CRITICAL',
    parameter: 'SO₂',
    duration: '6.2 hrs',
    time: '12 mins ago',
    fingerprints: ['Zero Variance', 'Calibration Lock'],
    shapScore: 98.4,
    cid: 'RED',
  },
  {
    id: 'ALT-2025-0317',
    factory: 'Tata Power Unit 3',
    cluster: 'Trombay',
    type: 'Pre-Inspection Emission Dip',
    detail: 'PM₁₀ dropped 68% exactly 4 hours before scheduled CIS inspection on 18 Jul. Pattern matches 2 prior inspection visits. Statistical correlation r = −0.89.',
    severity: 'HIGH',
    parameter: 'PM₁₀',
    duration: '4 hrs',
    time: '1 hour ago',
    fingerprints: ['Inspection Dip', 'Rebound Spike'],
    shapScore: 82.1,
    cid: 'RED',
  },
  {
    id: 'ALT-2025-0316',
    factory: 'Reliance Industries',
    cluster: 'Navi Mumbai',
    type: 'Night Data Gap',
    detail: 'CEMS transmission interrupted from 11:02 PM to 03:18 AM (4.3 hrs). No valid readings logged. Server-side rejection logs show unusual packet error burst at 10:58 PM.',
    severity: 'HIGH',
    parameter: 'NOX',
    duration: '4.3 hrs',
    time: '4 hours ago',
    fingerprints: ['Night Offline', 'Selective Gap'],
    shapScore: 74.3,
    cid: 'RED',
  },
  {
    id: 'ALT-2025-0315',
    factory: 'Hindalco Ltd.',
    cluster: 'Taloja MIDC',
    type: 'Cross-Parameter Decoupling',
    detail: 'NOX readings remain stable at 29 ppm while SO₂ is in variance-zero flatline. Physically impossible during normal combustion — indicative of selective sensor manipulation.',
    severity: 'MEDIUM',
    parameter: 'SO₂ + NOX',
    duration: '2.1 hrs',
    time: '6 hours ago',
    fingerprints: ['Cross-Param Decoupling'],
    shapScore: 55.7,
    cid: 'ORANGE',
  },
  {
    id: 'ALT-2025-0314',
    factory: 'AARTI Chemicals',
    cluster: 'Tarapur MIDC',
    type: 'Calibration Mismatch',
    detail: 'CEMS calibration audit shows discrepancy between reference stack test value (72 ppm SO₂) and sensor-reported value (38 ppm SO₂). Possible biased calibration.',
    severity: 'MEDIUM',
    parameter: 'SO₂',
    duration: '—',
    time: '1 day ago',
    fingerprints: ['Calibration Mismatch'],
    shapScore: 48.2,
    cid: 'ORANGE',
  },
];

export const mockDashboardMetrics: MetricData[] = [
  { label: 'Avg Tamper Score', value: '42%', trend: '+5%' },
  { label: 'Flatlines (30 Days)', value: '18', trend: '-2' },
  { label: 'Correlated Insp. Dips', value: '7', trend: '+3' },
  { label: 'Night Data Gaps (10P-5A)', value: '24', trend: '0' },
];

export const mockLeaderboard: FactoryLeaderboard[] = [
  { id: 'FAC-001', name: 'Deepak Fertilizers', score: 98, color: '#ef4444' },
  { id: 'FAC-002', name: 'Tata Power', score: 82, color: '#ef4444' },
  { id: 'FAC-003', name: 'Reliance Ind.', score: 65, color: '#f97316' },
  { id: 'FAC-004', name: 'Hindalco', score: 55, color: '#f97316' },
  { id: 'FAC-005', name: 'JSW Steel', score: 48, color: '#f97316' },
  { id: 'FAC-006', name: 'Larsen & Toubro', score: 42, color: '#f59e0b' },
  { id: 'FAC-007', name: 'Mahindra & Mahindra', score: 38, color: '#f59e0b' },
  { id: 'FAC-008', name: 'Aarti Industries', score: 35, color: '#f59e0b' },
  { id: 'FAC-009', name: 'IG Petrochemicals', score: 29, color: '#eab308' },
  { id: 'FAC-010', name: 'Taloja Copper', score: 24, color: '#eab308' },
  { id: 'FAC-011', name: 'Pidilite Industries', score: 18, color: '#10b981' },
  { id: 'FAC-012', name: 'Godrej Agrovet', score: 15, color: '#10b981' },
  { id: 'FAC-013', name: 'Cipla Ltd', score: 12, color: '#10b981' },
  { id: 'FAC-014', name: 'Sun Pharma', score: 10, color: '#10b981' },
  { id: 'FAC-015', name: 'Asian Paints', score: 8, color: '#10b981' },
  { id: 'FAC-016', name: 'Castrol India', score: 6, color: '#10b981' },
  { id: 'FAC-017', name: 'Voltas Ltd', score: 4, color: '#10b981' },
  { id: 'FAC-018', name: 'Exide Industries', score: 2, color: '#10b981' },
  { id: 'FAC-019', name: 'Bharat Forge', score: 1, color: '#10b981' },
  { id: 'FAC-020', name: 'Thermax Ltd', score: 0, color: '#10b981' },
];

export const mockFingerprints: Fingerprint[] = [
  { name: 'Zero Variance', evidence: 'SO₂ var ≈ 0 for 6.2 hrs', status: 'red' },
  { name: 'Pre-Insp Drop', evidence: 'Value dropped 68% prior to visit', status: 'red' },
  { name: 'Rebound Spike', evidence: '+150% spike post-inspection', status: 'red' },
  { name: 'Cross-Param Decoupling', evidence: 'NOx normal while SO2 flatlined', status: 'amber' },
  { name: 'Night Offline', evidence: 'No gaps detected (10P - 5A)', status: 'green' },
  { name: 'Calibration Lock', evidence: 'Stuck on calibration val 140', status: 'red' },
];

export const mockShapData: ShapData[] = [
  { label: 'Zero Std Dev Flatline', val: 60 },
  { label: 'Pre-Inspection Dip', val: 18 },
  { label: 'Night Offline Pattern', val: 10 },
  { label: 'Other Factors', val: 12 },
];

export const mockTimelineData = {
  labels: ['Apr 10', 'Apr 11', 'Apr 12', 'Apr 13', 'Apr 14', 'Apr 15', 'Apr 16', 'Apr 17', 'Apr 18', 'Apr 19'],
  datasets: [
    { data: [420, 435, 410, 450, 450, 450, 450, 255, 270, 430], color: () => '#3b82f6', strokeWidth: 3 },
    { data: [150, 150, 150, 150, 150, 150, 150, 150, 150, 150], color: () => 'rgba(249, 115, 22, 0.6)', strokeWidth: 2 },
  ],
};

export const mockCalendarData = {
  labels: ['Apr 1', 'Apr 5', 'Apr 10', 'Apr 15', 'Apr 20', 'Apr 25', 'Apr 30'],
  datasets: [{ data: [80, 85, 20, 90, 88, 18, 85], color: () => '#3b82f6', strokeWidth: 2 }],
};

export const mockEvidenceTimeline = [
  { date: '01 May 2025', event: 'CEMS node installed & calibrated', type: 'info' },
  { date: '12 Jun 2025', event: 'First flatline anomaly detected (SO₂ for 2.1 hrs)', type: 'warn' },
  { date: '18 Jun 2025', event: 'MPCB CIS inspection — emissions dropped 65% before visit', type: 'danger' },
  { date: '20 Jun 2025', event: 'Post-inspection rebound — SO₂ +130% within 6 hours', type: 'danger' },
  { date: '05 Jul 2025', event: 'Night data gap 11 PM – 3 AM (no transmission)', type: 'warn' },
  { date: '18 Jul 2025', event: 'MPCB CIS inspection — same dip pattern repeated', type: 'danger' },
  { date: '20 Jul 2025', event: 'AI flags CRITICAL — 6.2 hr zero-variance SO₂ flatline', type: 'danger' },
  { date: '20 Jul 2025', event: 'Enforcement notice ALT-2025-0318 auto-generated', type: 'action' },
];
