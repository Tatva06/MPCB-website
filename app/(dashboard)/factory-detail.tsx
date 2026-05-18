import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useQuery } from '@tanstack/react-query';
import { FadeInView } from '../../components/common/FadeInView';

import ResponsiveChartContainer from '../../components/common/ResponsiveChartContainer';
import Skeleton from '../../components/common/Skeleton';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';

import { getEvidenceTimeline } from '../../services/api';
import { useThemeColor } from '../../hooks/useThemeColor';

export default function FactoryDetailScreen() {
  const theme = useThemeColor();
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'evidence'>('overview');

  const { data: timelineEvents, isLoading } = useQuery({ queryKey: ['evidenceTimeline'], queryFn: getEvidenceTimeline });

  const chartConfig = {
    backgroundColor: theme.surface,
    backgroundGradientFrom: theme.surface,
    backgroundGradientTo: theme.surface,
    color: (o = 1) => `rgba(59, 130, 246, ${o})`, // theme.primary equivalent
    labelColor: (o = 1) => `rgba(100, 116, 139, ${o})`, // theme.textSecondary equivalent
    propsForBackgroundLines: { strokeDasharray: '', stroke: theme.border },
    propsForLabels: { fontSize: 10 },
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.sidebar }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Go Back">
          <Feather name="arrow-left" size={16} color={theme.primary} />
          <Text style={[styles.backText, { color: theme.primary }]}>Back to Dashboard</Text>
        </Pressable>
        <FadeInView delay={0} translateY={10}>
          <View style={styles.headerTop}>
            <View style={[styles.riskBadge, { backgroundColor: theme.danger }]}>
              <Text style={styles.riskBadgeText}>CRITICAL</Text>
            </View>
            <Text style={[styles.complianceId, { color: theme.textSecondary }]}>MPCB/TLJ/2025/ENF/0318</Text>
          </View>
          <Text style={[styles.factoryName, { color: '#fff' }]}>Deepak Fertilizers Pvt. Ltd.</Text>
          <Text style={[styles.factoryMeta, { color: theme.textSecondary }]}>Taloja MIDC, Raigad · Red Category · CTO No. MPCB/CTO/TLJ/2024/0041</Text>
          <View style={styles.headerStats}>
            {[
              { label: 'Tamper Score', value: '98%', color: theme.danger },
              { label: 'SHAP Confidence', value: '98.4%', color: '#8b5cf6' },
              { label: 'Violations (30d)', value: '7', color: theme.warning },
              { label: 'CIS Inspections', value: '2', color: theme.primary },
            ].map((s) => (
              <View key={s.label} style={[styles.headerStat, { borderRightColor: theme.border }]}>
                <Text style={[styles.headerStatValue, { color: s.color }]}>{s.value}</Text>
                <Text style={[styles.headerStatLabel, { color: theme.textSecondary }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </FadeInView>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        {(['overview', 'timeline', 'evidence'] as const).map((t) => (
          <Pressable 
            key={t} 
            onPress={() => setActiveTab(t)} 
            style={[styles.tab, activeTab === t && { borderBottomColor: theme.primary }]}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${t} tab`}
            accessibilityState={{ selected: activeTab === t }}
          >
            <Text style={[styles.tabText, { color: activeTab === t ? theme.primary : theme.textSecondary }]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === 'overview' && (
          <FadeInView delay={0} translateY={15}>
            {/* SO2 Forensic Chart */}
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>SO₂ Forensic Pattern — 20 July 2025</Text>
              <Text style={[styles.cardSub, { color: theme.textSecondary }]}>Flatline at 140 ppm for 6.2 hours. Legal limit: 100 ppm (orange)</Text>
              <ErrorBoundary>
                <ResponsiveChartContainer minWidth={280}>
                  {(chartWidth) => (
                    <LineChart
                      data={{
                        labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
                        datasets: [
                          { data: [140, 140, 140, 40, 50, 190], color: () => theme.primary, strokeWidth: 2.5 },
                          { data: [100, 100, 100, 100, 100, 100], color: () => 'rgba(249,115,22,0.8)', strokeWidth: 1.5 },
                        ],
                      }}
                      width={chartWidth}
                      height={200}
                      chartConfig={chartConfig}
                      withDots={false}
                      bezier
                      style={{ marginLeft: -10 }}
                    />
                  )}
                </ResponsiveChartContainer>
              </ErrorBoundary>
              {/* Annotations */}
              <View style={styles.annotationRow}>
                <View style={styles.annotation}>
                  <View style={[styles.annotDot, { backgroundColor: theme.danger }]} />
                  <Text style={[styles.annotText, { color: theme.textSecondary }]}>Flatline zone (0–14:00)</Text>
                </View>
                <View style={styles.annotation}>
                  <View style={[styles.annotDot, { backgroundColor: theme.success }]} />
                  <Text style={[styles.annotText, { color: theme.textSecondary }]}>Sudden dip (inspection prep)</Text>
                </View>
                <View style={styles.annotation}>
                  <View style={[styles.annotDot, { backgroundColor: theme.warning }]} />
                  <Text style={[styles.annotText, { color: theme.textSecondary }]}>Rebound spike</Text>
                </View>
              </View>
            </View>

            {/* CEMS Stack Details */}
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>CEMS Stack Configuration</Text>
              <View style={[styles.tableWrapper, { borderColor: theme.border }]}>
                {[
                  ['Node ID', 'DF-SO2-04', 'DF-NOX-01', 'DF-PM10-02'],
                  ['Parameter', 'SO₂', 'NOX', 'PM₁₀'],
                  ['Legal Limit', '100 ppm', '80 ppm', '60 µg/m³'],
                  ['Last Reading', '190 ppm ⚠', '45 ppm ✓', '110 µg/m³ ⚠'],
                  ['Status', 'TAMPERED', 'NORMAL', 'EXCEEDED'],
                ].map((row, ri) => (
                  <View key={ri} style={[styles.tableRow, { borderBottomColor: theme.border }, ri === 0 && { backgroundColor: theme.background }]}>
                    {row.map((cell, ci) => (
                      <Text key={ci} style={[
                        styles.tableCell,
                        { color: theme.textSecondary },
                        ri === 0 && { color: theme.text, fontWeight: '700' },
                        ci === 0 && { color: theme.text, fontWeight: '700' },
                        cell.includes('TAMPERED') && { color: theme.danger, fontWeight: '700' },
                        cell.includes('EXCEEDED') && { color: theme.warning, fontWeight: '700' },
                        cell.includes('NORMAL') && { color: theme.success, fontWeight: '700' },
                      ]}>{cell}</Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>

            {/* Risk Summary */}
            <View style={[styles.verdictCard, { backgroundColor: theme.dangerBg, borderColor: theme.dangerBorder }]}>
              <View style={styles.verdictHeader}>
                <Feather name="shield-off" size={18} color={theme.danger} />
                <Text style={[styles.verdictTitle, { color: theme.danger }]}>AI Enforcement Verdict</Text>
              </View>
              <Text style={[styles.verdictBody, { color: theme.textSecondary }]}>
                Deepak Fertilizers has demonstrated a statistically significant pattern of CEMS data manipulation
                across 3 monitored parameters. The zero-variance flatline, combined with inspection-correlated
                dips (r = −0.87) and post-inspection rebound spikes, are consistent with active tampering of
                the Data Acquisition and Handling System (DAHS) software. Immediate enforcement action is recommended.
              </Text>
              <Pressable 
                onPress={() => router.push('/modal')} 
                style={[styles.verdictBtn, { backgroundColor: theme.danger }]}
                accessibilityRole="button"
                accessibilityLabel="Generate Enforcement Notice"
              >
                <Feather name="file-text" size={14} color="#fff" />
                <Text style={styles.verdictBtnText}>Generate Enforcement Notice</Text>
              </Pressable>
            </View>
          </FadeInView>
        )}

        {activeTab === 'timeline' && (
          <FadeInView delay={0} translateY={15} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Forensic Event Timeline</Text>
            <Text style={[styles.cardSub, { color: theme.textSecondary }]}>Chronological record of CEMS anomalies and enforcement actions</Text>
            <ErrorBoundary>
              {isLoading ? (
                <View style={{ gap: 20 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <View key={i} style={{ flexDirection: 'row', gap: 14 }}>
                      <Skeleton width={12} height={12} borderRadius={6} />
                      <View style={{ flex: 1, gap: 6 }}>
                        <Skeleton width={80} height={10} />
                        <Skeleton width="100%" height={16} />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                timelineEvents?.map((ev, i) => (
                  <View key={i} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={[
                        styles.timelineDot,
                        ev.type === 'danger' && { backgroundColor: theme.danger },
                        ev.type === 'warn' && { backgroundColor: theme.warning },
                        ev.type === 'info' && { backgroundColor: theme.primary },
                        ev.type === 'action' && { backgroundColor: '#8b5cf6' },
                      ]} />
                      {i < timelineEvents.length - 1 && <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />}
                    </View>
                    <View style={styles.timelineRight}>
                      <Text style={[styles.timelineDate, { color: theme.textSecondary }]}>{ev.date}</Text>
                      <Text style={[styles.timelineEvent, { color: theme.text }]}>{ev.event}</Text>
                    </View>
                  </View>
                ))
              )}
            </ErrorBoundary>
          </FadeInView>
        )}

        {activeTab === 'evidence' && (
          <FadeInView delay={0} translateY={15} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Documented Evidence Packets</Text>
            {[
              { title: 'Raw CEMS Logs (6.2 hr flatline)', size: '2.4 MB', type: 'CSV', date: '20-07-2025' },
              { title: 'SHAP Analysis Report', size: '840 KB', type: 'PDF', date: '20-07-2025' },
              { title: 'Inspection Correlation Analysis', size: '1.1 MB', type: 'PDF', date: '18-07-2025' },
              { title: '90-Day Trend Export', size: '3.8 MB', type: 'XLSX', date: '20-07-2025' },
              { title: 'DAHS Audit Log', size: '560 KB', type: 'JSON', date: '20-07-2025' },
            ].map((ev, i) => (
              <View key={i} style={[styles.evidenceItem, { borderBottomColor: theme.background }]}>
                <View style={[styles.evidenceIcon, { backgroundColor: theme.primaryBg }]}>
                  <Feather name="file" size={14} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.evidenceTitle, { color: theme.text }]}>{ev.title}</Text>
                  <Text style={[styles.evidenceMeta, { color: theme.textSecondary }]}>{ev.type} · {ev.size} · {ev.date}</Text>
                </View>
                <Pressable 
                  style={[styles.downloadBtn, { backgroundColor: theme.primaryBg }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Download ${ev.title}`}
                >
                  <Feather name="download" size={13} color={theme.primary} />
                </Pressable>
              </View>
            ))}
          </FadeInView>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backText: { fontSize: 13, fontWeight: '600' },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  riskBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  riskBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  complianceId: { fontSize: 11, fontFamily: 'monospace' },
  factoryName: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  factoryMeta: { fontSize: 12, marginBottom: 20 },
  headerStats: { flexDirection: 'row', gap: 1 },
  headerStat: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12, alignItems: 'center', borderRightWidth: 1,
  },
  headerStatValue: { fontSize: 20, fontWeight: '900', marginBottom: 2 },
  headerStatLabel: { fontSize: 9, textAlign: 'center', fontWeight: '600' },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1, paddingHorizontal: 20,
  },
  tab: {
    paddingVertical: 14, paddingHorizontal: 4, marginRight: 24,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabText: { fontSize: 14, fontWeight: '600' },
  content: { padding: 20, gap: 16 },
  card: { borderRadius: 16, borderWidth: 1, padding: 20 },
  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  cardSub: { fontSize: 11, marginBottom: 16 },
  annotationRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', marginTop: 8 },
  annotation: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  annotDot: { width: 8, height: 8, borderRadius: 4 },
  annotText: { fontSize: 11 },
  tableWrapper: { borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tableCell: { flex: 1, fontSize: 11, padding: 10 },
  verdictCard: {
    borderWidth: 1,
    borderRadius: 16, padding: 20,
  },
  verdictHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  verdictTitle: { fontSize: 15, fontWeight: '800' },
  verdictBody: { fontSize: 13, lineHeight: 22, marginBottom: 16 },
  verdictBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 10, padding: 14,
    justifyContent: 'center',
  },
  verdictBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  timelineItem: { flexDirection: 'row', gap: 14, marginBottom: 4 },
  timelineLeft: { alignItems: 'center', width: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 3 },
  timelineLine: { width: 2, flex: 1, marginVertical: 4 },
  timelineRight: { flex: 1, paddingBottom: 20 },
  timelineDate: { fontSize: 10, fontWeight: '700', marginBottom: 3 },
  timelineEvent: { fontSize: 13, lineHeight: 20 },
  evidenceItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1,
  },
  evidenceIcon: {
    width: 36, height: 36,
    borderRadius: 8, justifyContent: 'center', alignItems: 'center',
  },
  evidenceTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  evidenceMeta: { fontSize: 11 },
  downloadBtn: {
    width: 34, height: 34,
    borderRadius: 8, justifyContent: 'center', alignItems: 'center',
  },
});