export interface FactoryLeaderboard {
  name: string;
  score: number;
  color: string;
}

export interface MetricData {
  label: string;
  value: string;
  trend: string;
}

export interface Fingerprint {
  name: string;
  evidence: string;
  status: 'red' | 'amber' | 'green';
}

export interface ShapData {
  label: string;
  val: number;
}

export interface Alert {
  id: string;
  factory: string;
  cluster: string;
  type: string;
  detail: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  parameter: string;
  duration: string;
  time: string;
  fingerprints: string[];
  shapScore: number;
  cid: string;
}

export interface User {
  id: string;
  name: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
