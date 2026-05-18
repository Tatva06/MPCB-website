import { Alert, FactoryLeaderboard, Fingerprint, MetricData, ShapData } from '../types';
import {
  mockAlerts,
  mockCalendarData,
  mockDashboardMetrics,
  mockEvidenceTimeline,
  mockFingerprints,
  mockLeaderboard,
  mockShapData,
  mockTimelineData,
} from './mockData';

// Simulated delay for fake API calls
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getAlerts = async (): Promise<Alert[]> => {
  await delay(600);
  return mockAlerts;
};

export const getDashboardMetrics = async (): Promise<MetricData[]> => {
  await delay(400);
  return mockDashboardMetrics;
};

export const getLeaderboard = async (): Promise<FactoryLeaderboard[]> => {
  await delay(400);
  return mockLeaderboard;
};

export const getFingerprints = async (): Promise<Fingerprint[]> => {
  await delay(500);
  return mockFingerprints;
};

export const getShapData = async (): Promise<ShapData[]> => {
  await delay(500);
  return mockShapData;
};

export const getChartsData = async () => {
  await delay(500);
  return {
    timeline: mockTimelineData,
    calendar: mockCalendarData,
  };
};

export const getEvidenceTimeline = async () => {
  await delay(300);
  return mockEvidenceTimeline;
};
