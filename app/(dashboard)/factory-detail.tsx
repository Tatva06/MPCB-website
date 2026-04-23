import { Feather } from '@expo/vector-icons';
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

const EVIDENCE_TIMELINE = [
  { date: '01 May 2025', event: 'CEMS node installed & calibrated', type: 'info' },
  { date: '12 Jun 2025', event: 'First flatline anomaly detected (SO₂ for 2.1 hrs)', type: 'warn' },
  { date: '18 Jun 2025', event: 'MPCB CIS inspection — emissions dropped 65% before visit', type: 'danger' },
  { date: '20 Jun 2025', event: 'Post-inspection rebound — SO₂ +130% within 6 hours', type: 'danger' },
  { date: '05 Jul 2025', event: 'Night data gap 11 PM – 3 AM (no transmission)', type: 'warn' },
  { date: '18 Jul 2025', event: 'MPCB CIS inspection — same dip pattern repeated', type: 'danger' },
  { date: '20 Jul 2025', event: 'AI flags CRITICAL — 6.2 hr zero-variance SO₂ flatline', type: 'danger' },
  { date: '20 Jul 2025', event: 'Enforcement notice ALT-2025-0318 auto-generated', type: 'action' },
];

const chartConfig = {
  backgroundColor: '#fff', backgroundGradientFrom: '#fff', backgroundGradientTo: '#fff',
  color: (o = 1) => `rgba(37,99,235,${o})`,
  labelColor: (o = 1) => `rgba(100,116,139,${o})`,
  propsForBackgroundLines: { strokeDasharray: '', stroke: 'rgba(226,232,240,0.8)' },
  propsForLabels: { fontSize: 10 },
};

export default function FactoryDetailScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const chartW = isMobile ? width - 64 : 500;
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'evidence'>('overview');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={16} color="#2563eb" />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </Pressable>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.riskBadge}>
              <Text style={styles.riskBadgeText}>CRITICAL</Text>
            </View>
            <Text style={styles.complianceId}>MPCB/TLJ/2025/ENF/0318</Text>
          </View>
          <Text style={styles.factoryName}>Deepak Fertilizers Pvt. Ltd.</Text>
          <Text style={styles.factoryMeta}>Taloja MIDC, Raigad · Red Category · CTO No. MPCB/CTO/TLJ/2024/0041</Text>
          <View style={styles.headerStats}>
            {[
              { label: 'Tamper Score', value: '98%', color: '#ef4444' },
              { label: 'SHAP Confidence', value: '98.4%', color: '#8b5cf6' },
              { label: 'Violations (30d)', value: '7', color: '#f97316' },
              { label: 'CIS Inspections', value: '2', color: '#2563eb' },
            ].map((s) => (
              <View key={s.label} style={styles.headerStat}>
                <Text style={[styles.headerStatValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.headerStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['overview', 'timeline', 'evidence'] as const).map((t) => (
          <Pressable key={t} onPress={() => setActiveTab(t)} style={[styles.tab, activeTab === t && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === 'overview' && (
          <>
            {/* SO2 Forensic Chart */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>SO₂ Forensic Pattern — 20 July 2025</Text>
              <Text style={styles.cardSub}>Flatline at 140 ppm for 6.2 hours. Legal limit: 100 ppm (orange)</Text>
              <LineChart
                data={{
                  labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
                  datasets: [
                    { data: [140, 140, 140, 40, 50, 190], color: () => '#2563eb', strokeWidth: 2.5 },
                    { data: [100, 100, 100, 100, 100, 100], color: () => 'rgba(249,115,22,0.8)', strokeWidth: 1.5 },
                  ],
                }}
                width={chartW}
                height={200}
                chartConfig={chartConfig}
                withDots={false}
                bezier
                style={{ marginLeft: -10 }}
              />
              {/* Annotations */}
              <View style={styles.annotationRow}>
                <View style={styles.annotation}>
                  <View style={[styles.annotDot, { backgroundColor: '#ef4444' }]} />
                  <Text style={styles.annotText}>Flatline zone (0–14:00)</Text>
                </View>
                <View style={styles.annotation}>
                  <View style={[styles.annotDot, { backgroundColor: '#10b981' }]} />
                  <Text style={styles.annotText}>Sudden dip (inspection prep)</Text>
                </View>
                <View style={styles.annotation}>
                  <View style={[styles.annotDot, { backgroundColor: '#f97316' }]} />
                  <Text style={styles.annotText}>Rebound spike</Text>
                </View>
              </View>
            </View>

            {/* CEMS Stack Details */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>CEMS Stack Configuration</Text>
              <View style={styles.tableWrapper}>
                {[
                  ['Node ID', 'DF-SO2-04', 'DF-NOX-01', 'DF-PM10-02'],
                  ['Parameter', 'SO₂', 'NOX', 'PM₁₀'],
                  ['Legal Limit', '100 ppm', '80 ppm', '60 µg/m³'],
                  ['Last Reading', '190 ppm ⚠', '45 ppm ✓', '110 µg/m³ ⚠'],
                  ['Status', 'TAMPERED', 'NORMAL', 'EXCEEDED'],
                ].map((row, ri) => (
                  <View key={ri} style={[styles.tableRow, ri === 0 && styles.tableHeaderRow]}>
                    {row.map((cell, ci) => (
                      <Text key={ci} style={[
                        styles.tableCell,
                        ri === 0 && styles.tableCellHeader,
                        ci === 0 && styles.tableCellLabel,
                        cell.includes('TAMPERED') && { color: '#ef4444', fontWeight: '700' },
                        cell.includes('EXCEEDED') && { color: '#f97316', fontWeight: '700' },
                        cell.includes('NORMAL') && { color: '#10b981', fontWeight: '700' },
                      ]}>{cell}</Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>

            {/* Risk Summary */}
            <View style={styles.verdictCard}>
              <View style={styles.verdictHeader}>
                <Feather name="shield-off" size={18} color="#b91c1c" />
                <Text style={styles.verdictTitle}>AI Enforcement Verdict</Text>
              </View>
              <Text style={styles.verdictBody}>
                Deepak Fertilizers has demonstrated a statistically significant pattern of CEMS data manipulation
                across 3 monitored parameters. The zero-variance flatline, combined with inspection-correlated
                dips (r = −0.87) and post-inspection rebound spikes, are consistent with active tampering of
                the Data Acquisition and Handling System (DAHS) software. Immediate enforcement action is recommended.
              </Text>
              <Pressable onPress={() => router.push('/modal' as any)} style={styles.verdictBtn}>
                <Feather name="file-text" size={14} color="#fff" />
                <Text style={styles.verdictBtnText}>Generate Enforcement Notice</Text>
              </Pressable>
            </View>
          </>
        )}

        {activeTab === 'timeline' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Forensic Event Timeline</Text>
            <Text style={styles.cardSub}>Chronological record of CEMS anomalies and enforcement actions</Text>
            {EVIDENCE_TIMELINE.map((ev, i) => (
              <View key={i} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.timelineDot,
                    ev.type === 'danger' && { backgroundColor: '#ef4444' },
                    ev.type === 'warn' && { backgroundColor: '#f97316' },
                    ev.type === 'info' && { backgroundColor: '#2563eb' },
                    ev.type === 'action' && { backgroundColor: '#8b5cf6' },
                  ]} />
                  {i < EVIDENCE_TIMELINE.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineRight}>
                  <Text style={styles.timelineDate}>{ev.date}</Text>
                  <Text style={styles.timelineEvent}>{ev.event}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'evidence' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Documented Evidence Packets</Text>
            {[
              { title: 'Raw CEMS Logs (6.2 hr flatline)', size: '2.4 MB', type: 'CSV', date: '20-07-2025' },
              { title: 'SHAP Analysis Report', size: '840 KB', type: 'PDF', date: '20-07-2025' },
              { title: 'Inspection Correlation Analysis', size: '1.1 MB', type: 'PDF', date: '18-07-2025' },
              { title: '90-Day Trend Export', size: '3.8 MB', type: 'XLSX', date: '20-07-2025' },
              { title: 'DAHS Audit Log', size: '560 KB', type: 'JSON', date: '20-07-2025' },
            ].map((ev, i) => (
              <View key={i} style={styles.evidenceItem}>
                <View style={styles.evidenceIcon}>
                  <Feather name="file" size={14} color="#2563eb" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.evidenceTitle}>{ev.title}</Text>
                  <Text style={styles.evidenceMeta}>{ev.type} · {ev.size} · {ev.date}</Text>
                </View>
                <Pressable style={styles.downloadBtn}>
                  <Feather name="download" size={13} color="#2563eb" />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { backgroundColor: '#0b1120', padding: 24 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backText: { color: '#2563eb', fontSize: 13, fontWeight: '600' },
  headerContent: {},
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  riskBadge: { backgroundColor: '#ef4444', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  riskBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  complianceId: { fontSize: 11, color: '#475569', fontFamily: 'monospace' },
  factoryName: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4 },
  factoryMeta: { fontSize: 12, color: '#475569', marginBottom: 20 },
  headerStats: { flexDirection: 'row', gap: 1 },
  headerStat: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#1e293b',
  },
  headerStatValue: { fontSize: 20, fontWeight: '900', marginBottom: 2 },
  headerStatLabel: { fontSize: 9, color: '#475569', textAlign: 'center', fontWeight: '600' },
  tabBar: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingHorizontal: 20,
  },
  tab: {
    paddingVertical: 14, paddingHorizontal: 4, marginRight: 24,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#2563eb' },
  tabText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  tabTextActive: { color: '#2563eb' },
  content: { padding: 20, gap: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', padding: 20 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  cardSub: { fontSize: 11, color: '#64748b', marginBottom: 16 },
  annotationRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', marginTop: 8 },
  annotation: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  annotDot: { width: 8, height: 8, borderRadius: 4 },
  annotText: { fontSize: 11, color: '#64748b' },
  tableWrapper: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  tableHeaderRow: { backgroundColor: '#f8fafc' },
  tableCell: { flex: 1, fontSize: 11, color: '#475569', padding: 10 },
  tableCellHeader: { color: '#0f172a', fontWeight: '700', fontSize: 10 },
  tableCellLabel: { fontWeight: '700', color: '#0f172a' },
  verdictCard: {
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
    borderRadius: 16, padding: 20,
  },
  verdictHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  verdictTitle: { fontSize: 15, fontWeight: '800', color: '#b91c1c' },
  verdictBody: { fontSize: 13, color: '#475569', lineHeight: 22, marginBottom: 16 },
  verdictBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#ef4444', borderRadius: 10, padding: 14,
    justifyContent: 'center',
  },
  verdictBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  timelineItem: { flexDirection: 'row', gap: 14, marginBottom: 4 },
  timelineLeft: { alignItems: 'center', width: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2563eb', marginTop: 3 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#e2e8f0', marginVertical: 4 },
  timelineRight: { flex: 1, paddingBottom: 20 },
  timelineDate: { fontSize: 10, color: '#94a3b8', fontWeight: '700', marginBottom: 3 },
  timelineEvent: { fontSize: 13, color: '#0f172a', lineHeight: 20 },
  evidenceItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  evidenceIcon: {
    width: 36, height: 36, backgroundColor: '#eff6ff',
    borderRadius: 8, justifyContent: 'center', alignItems: 'center',
  },
  evidenceTitle: { fontSize: 13, color: '#0f172a', fontWeight: '600', marginBottom: 2 },
  evidenceMeta: { fontSize: 11, color: '#94a3b8' },
  downloadBtn: {
    width: 34, height: 34, backgroundColor: '#eff6ff',
    borderRadius: 8, justifyContent: 'center', alignItems: 'center',
  },
});