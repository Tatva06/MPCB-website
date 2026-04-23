import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function ComprehensiveDashboard() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // FIX: guard against 0/NaN — sidebar is 260, padding is 80 each side
  const rawContentWidth = isMobile ? width - 40 : width - 260 - 80;
  const contentWidth = Math.max(rawContentWidth, 300); // never below 300

  const [activeParam, setActiveParam] = useState('SO2');

  const timelineData = {
    labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
    datasets: [
      { data: [140, 140, 140, 40, 50, 190], color: () => '#3b82f6', strokeWidth: 3 },
      { data: [100, 100, 100, 100, 100, 100], color: () => 'rgba(249, 115, 22, 0.6)', strokeWidth: 2 },
    ],
  };

  const calendarData = {
    labels: ['Day 1', 'Day 15', 'Day 30', 'Day 45', 'Day 60', 'Day 75', 'Day 90'],
    datasets: [{ data: [80, 85, 20, 90, 88, 18, 85], color: () => '#3b82f6', strokeWidth: 2 }],
  };

  // FIX: safe chart widths — never NaN
  const timelineChartWidth = Math.max(contentWidth * 0.55, 280);
  const calendarChartWidth = Math.max(contentWidth, 300);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.contentWrapper}>

        {/* ── TOP BAR ── */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>Taloja MIDC Cluster</Text>
            <Text style={styles.pageSub}>12 Units Monitored • Last Sync: 2 mins ago</Text>
          </View>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, styles.badgeRed]}>
              <Text style={styles.badgeTextRed}>3 HIGH-RISK</Text>
            </View>
            <View style={[styles.badge, styles.badgeAmber]}>
              <Text style={styles.badgeTextAmber}>5 SUSPICIOUS</Text>
            </View>
            <View style={[styles.badge, styles.badgeGreen]}>
              <Text style={styles.badgeTextGreen}>4 CLEAN</Text>
            </View>
          </View>
        </View>

        {/* ── 4 METRIC CARDS ── */}
        <View style={styles.metricsRow}>
          {[
            { label: 'Avg Tamper Score', value: '42%', trend: '+5%' },
            { label: 'Flatlines (30 Days)', value: '18', trend: '-2' },
            { label: 'Correlated Insp. Dips', value: '7', trend: '+3' },
            { label: 'Night Data Gaps (10P-5A)', value: '24', trend: '0' },
          ].map((metric, i) => (
            <View key={i} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricTrend}>{metric.trend}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── MIDDLE ROW ── */}
        <View style={isMobile ? styles.gridCol : styles.gridRow}>

          {/* Factory Leaderboard */}
          <View style={[styles.card, isMobile ? {} : { flex: 1.2 }]}>
            <Text style={styles.cardTitle}>Tamper Probability Ranking</Text>
            <View style={styles.leaderboardList}>
              {[
                { name: 'Deepak Fertilizers', score: 98, color: '#ef4444' },
                { name: 'Tata Power', score: 82, color: '#ef4444' },
                { name: 'Reliance Ind.', score: 65, color: '#f97316' },
                { name: 'Hindalco', score: 55, color: '#f97316' },
                { name: 'JSW Steel', score: 12, color: '#10b981' },
              ].map((factory, i) => (
                // FIX: tap leaderboard row → factory detail screen
                <Pressable
                  key={i}
                  style={styles.leaderboardItem}
                  onPress={() => router.push('/(dashboard)/factory-detail')}
                >
                  <View style={styles.leaderboardTextRow}>
                    <Text style={styles.factoryName}>{factory.name}</Text>
                    <Text style={[styles.factoryScore, { color: factory.color }]}>
                      {factory.score}%
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${factory.score}%` as any, backgroundColor: factory.color },
                      ]}
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Forensic Timeline */}
          <View style={[styles.card, isMobile ? {} : { flex: 2 }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Forensic Evidence: Deepak Fertilizers</Text>
              <View style={styles.tabRow}>
                {['SO2', 'NOX', 'PM10'].map((param) => (
                  <Pressable
                    key={param}
                    onPress={() => setActiveParam(param)}
                    style={[styles.tab, activeParam === param && styles.tabActive]}
                  >
                    <Text style={[styles.tabText, activeParam === param && styles.tabTextActive]}>
                      {param}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <Text style={styles.chartSubText}>
              Orange line indicates legal emission limit (100 ppm)
            </Text>
            <LineChart
              data={timelineData}
              width={timelineChartWidth}
              height={220}
              chartConfig={chartConfig}
              withDots={false}
              bezier
              style={styles.chartOffset}
            />
          </View>
        </View>

        {/* ── BOTTOM ROW ── */}
        <View style={isMobile ? styles.gridCol : styles.gridRow}>

          {/* Fingerprint Detection Grid */}
          <View style={[styles.card, isMobile ? {} : { flex: 2 }]}>
            <Text style={styles.cardTitle}>AI Fingerprint Grid (15 Vectors)</Text>
            <View style={styles.fingerprintGrid}>
              {[
                { name: 'Zero Variance', evidence: 'SO₂ var ≈ 0 for 6.2 hrs', status: 'red' },
                { name: 'Pre-Insp Drop', evidence: 'Value dropped 68% prior to visit', status: 'red' },
                { name: 'Rebound Spike', evidence: '+150% spike post-inspection', status: 'red' },
                { name: 'Cross-Param Decoupling', evidence: 'NOx normal while SO2 flatlined', status: 'amber' },
                { name: 'Night Offline', evidence: 'No gaps detected (10P - 5A)', status: 'green' },
                { name: 'Calibration Lock', evidence: 'Stuck on calibration val 140', status: 'red' },
              ].map((fp, i) => (
                <View
                  key={i}
                  style={[
                    styles.fpBox,
                    fp.status === 'red' && styles.fpBox_red,
                    fp.status === 'amber' && styles.fpBox_amber,
                    fp.status === 'green' && styles.fpBox_green,
                  ]}
                >
                  <Text
                    style={[
                      styles.fpName,
                      fp.status === 'red' && styles.fpText_red,
                      fp.status === 'amber' && styles.fpText_amber,
                      fp.status === 'green' && styles.fpText_green,
                    ]}
                  >
                    {fp.name}
                  </Text>
                  <Text style={styles.fpEvidence}>{fp.evidence}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* SHAP Explainability */}
          <View style={[styles.card, isMobile ? {} : { flex: 1.2 }]}>
            <Text style={styles.cardTitle}>SHAP Explainability (Why 98%?)</Text>
            <View style={styles.shapList}>
              {[
                { label: 'Zero Std Dev Flatline', val: 60 },
                { label: 'Pre-Inspection Dip', val: 18 },
                { label: 'Night Offline Pattern', val: 10 },
                { label: 'Other Factors', val: 12 },
              ].map((item, i) => (
                <View key={i} style={styles.shapItem}>
                  <Text style={styles.shapLabel}>{item.label}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={styles.shapBarBg}>
                      <View style={[styles.shapBarFill, { width: `${item.val}%` as any }]} />
                    </View>
                    <Text style={styles.shapValText}>{item.val}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── 90-DAY CALENDAR OVERLAY ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>90-Day Inspection Calendar Overlay (PM₁₀)</Text>
          <Text style={styles.chartSubText}>
            Red vertical markers indicate exact dates of CIS physical site visits.
          </Text>
          <View style={styles.overlayContainer}>
            <LineChart
              data={calendarData}
              width={calendarChartWidth}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={{ marginLeft: -20 }}
            />
            <View style={[styles.verticalMarker, { left: '30%' }]}>
              <Text style={styles.markerText}>VISIT 1</Text>
            </View>
            <View style={[styles.verticalMarker, { left: '72%' }]}>
              <Text style={styles.markerText}>VISIT 2</Text>
            </View>
          </View>
        </View>

      </View>
    </ScrollView>
  );
}

const chartConfig = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
  strokeWidth: 2,
  propsForBackgroundLines: { strokeDasharray: '' },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f9' },
  contentWrapper: {
    maxWidth: 1400,
    marginHorizontal: 'auto' as any,
    padding: 40,
    width: '100%',
    gap: 24,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 },
  pageTitle: { fontSize: 32, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 },
  pageSub: { fontSize: 15, color: '#64748b', marginTop: 4, fontWeight: '600' },
  badgeRow: { flexDirection: 'row', gap: 12 },
  badge: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1 },
  badgeRed: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  badgeTextRed: { color: '#b91c1c', fontSize: 12, fontWeight: '900' },
  badgeAmber: { backgroundColor: '#fff7ed', borderColor: '#fed7aa' },
  badgeTextAmber: { color: '#c2410c', fontSize: 12, fontWeight: '900' },
  badgeGreen: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  badgeTextGreen: { color: '#15803d', fontSize: 12, fontWeight: '900' },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  metricCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metricLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 12 },
  metricValue: { fontSize: 32, fontWeight: '900', color: '#0f172a' },
  metricTrend: { color: '#ef4444', fontWeight: 'bold', fontSize: 14 },
  gridRow: { flexDirection: 'row', gap: 24 },
  gridCol: { flexDirection: 'column', gap: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 20 },
  chartSubText: { fontSize: 12, color: '#64748b', marginBottom: 10 },
  chartOffset: { marginLeft: -10 },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 4,
    borderRadius: 8,
  },
  tab: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 6 },
  tabActive: { backgroundColor: '#fff' },
  tabText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  tabTextActive: { color: '#3b82f6' },
  leaderboardList: { gap: 16 },
  leaderboardItem: { gap: 6 },
  leaderboardTextRow: { flexDirection: 'row', justifyContent: 'space-between' },
  factoryName: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  factoryScore: { fontSize: 14, fontWeight: '900' },
  progressBarBg: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%' as any, borderRadius: 4 },
  fingerprintGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  fpBox: { width: '47%', padding: 16, borderRadius: 10, borderWidth: 1 },
  fpBox_red: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  fpBox_amber: { backgroundColor: '#fff7ed', borderColor: '#fed7aa' },
  fpBox_green: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  fpName: { fontSize: 13, fontWeight: '900', marginBottom: 4 },
  fpText_red: { color: '#b91c1c' },
  fpText_amber: { color: '#c2410c' },
  fpText_green: { color: '#15803d' },
  fpEvidence: { fontSize: 11, color: '#475569', fontWeight: '500' },
  shapList: { gap: 16 },
  shapItem: { gap: 6 },
  shapLabel: { fontSize: 13, fontWeight: '700', color: '#475569' },
  shapBarBg: { flex: 1, height: 16, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  shapBarFill: { height: '100%' as any, backgroundColor: '#3b82f6', borderRadius: 4 },
  shapValText: { width: 35, fontSize: 12, fontWeight: '900', color: '#0f172a' },
  overlayContainer: { position: 'relative', marginTop: 10 },
  verticalMarker: {
    position: 'absolute',
    top: 0,
    bottom: 25,
    width: 2,
    backgroundColor: 'rgba(239, 68, 68, 0.5)',
  },
  markerText: {
    position: 'absolute',
    top: -15,
    left: -20,
    fontSize: 10,
    color: '#ef4444',
    fontWeight: '900',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});