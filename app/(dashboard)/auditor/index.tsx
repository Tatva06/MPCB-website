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
import { useQuery } from '@tanstack/react-query';
import { FadeInView } from '../../components/common/FadeInView';

import LeaderboardItem from '../../components/dashboard/LeaderboardItem';
import MetricCard from '../../components/dashboard/MetricCard';
import ResponsiveChartContainer from '../../components/common/ResponsiveChartContainer';
import Skeleton from '../../components/common/Skeleton';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';

import { getChartsData, getDashboardMetrics, getFingerprints, getLeaderboard, getShapData } from '../../services/api';
import { useThemeColor } from '../../hooks/useThemeColor';

export default function ComprehensiveDashboard() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const theme = useThemeColor();

  const [activeParam, setActiveParam] = useState('SO2');

  const { data: metrics, isLoading: isMetricsLoading } = useQuery({ queryKey: ['metrics'], queryFn: getDashboardMetrics });
  const { data: leaderboard, isLoading: isLeaderboardLoading } = useQuery({ queryKey: ['leaderboard'], queryFn: getLeaderboard });
  const { data: fingerprints, isLoading: isFpLoading } = useQuery({ queryKey: ['fingerprints'], queryFn: getFingerprints });
  const { data: shapData, isLoading: isShapLoading } = useQuery({ queryKey: ['shap'], queryFn: getShapData });
  const { data: chartsData, isLoading: isChartsLoading } = useQuery({ queryKey: ['charts'], queryFn: getChartsData });

  const renderSkeletonList = (count: number, height: number) => (
    <View style={{ gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} height={height} borderRadius={8} />
      ))}
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.contentWrapper}>

        {/* ── TOP BAR ── */}
        <FadeInView delay={100} translateY={-10}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.pageTitle, { color: theme.text }]}>Taloja MIDC Cluster</Text>
              <Text style={[styles.pageSub, { color: theme.textSecondary }]}>12 Units Monitored • Last Sync: 2 mins ago</Text>
            </View>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: theme.dangerBg, borderColor: theme.dangerBorder }]}>
                <Text style={[styles.badgeTextRed, { color: theme.danger }]}>3 HIGH-RISK</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: theme.warningBg, borderColor: theme.warningBorder }]}>
                <Text style={[styles.badgeTextAmber, { color: theme.warning }]}>5 SUSPICIOUS</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: theme.successBg, borderColor: theme.successBorder }]}>
                <Text style={[styles.badgeTextGreen, { color: theme.success }]}>4 CLEAN</Text>
              </View>
            </View>
          </View>
        </FadeInView>

        {/* ── 4 METRIC CARDS ── */}
        <FadeInView delay={200} translateY={20}>
          <View style={styles.metricsRow}>
            {isMetricsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <View key={i} style={[styles.card, { flex: 1, minWidth: 140, backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Skeleton height={14} width={80} style={{ marginBottom: 12 }} />
                  <Skeleton height={32} width={100} />
                </View>
              ))
            ) : (
              metrics?.map((metric, i) => <MetricCard key={i} metric={metric} />)
            )}
          </View>
        </FadeInView>

        {/* ── MIDDLE ROW ── */}
        <View style={isMobile ? styles.gridCol : styles.gridRow}>

          {/* Factory Leaderboard */}
          <FadeInView delay={300} translateY={15} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, flex: isMobile ? 0 : 1.2 }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Tamper Probability Ranking</Text>
            <ErrorBoundary>
              {isLeaderboardLoading ? renderSkeletonList(5, 30) : (
                <View style={styles.leaderboardList}>
                  {leaderboard?.map((factory, i) => <LeaderboardItem key={i} factory={factory} />)}
                </View>
              )}
            </ErrorBoundary>
          </FadeInView>

          {/* Forensic Timeline */}
          <FadeInView delay={400} translateY={15} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, flex: isMobile ? 0 : 2 }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Forensic Evidence: Deepak Fertilizers</Text>
              <View style={[styles.tabRow, { backgroundColor: theme.background }]}>
                {['SO2', 'NOX', 'PM10'].map((param) => (
                  <Pressable
                    key={param}
                    onPress={() => setActiveParam(param)}
                    style={[styles.tab, activeParam === param && { backgroundColor: theme.surface }]}
                  >
                    <Text style={[styles.tabText, { color: theme.textSecondary }, activeParam === param && { color: theme.primary }]}>
                      {param}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <Text style={[styles.chartSubText, { color: theme.textSecondary }]}>
              Orange line indicates legal emission limit (100 ppm)
            </Text>
            <ErrorBoundary>
              {isChartsLoading ? <Skeleton height={220} /> : (
                <ResponsiveChartContainer minWidth={280}>
                  {(chartWidth) => (
                    <LineChart
                      data={chartsData!.timeline}
                      width={chartWidth}
                      height={220}
                      chartConfig={{
                        backgroundColor: theme.surface,
                        backgroundGradientFrom: theme.surface,
                        backgroundGradientTo: theme.surface,
                        color: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`, // Secondary line color
                        labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                        strokeWidth: 2,
                        propsForBackgroundLines: { strokeDasharray: '', stroke: theme.border },
                      }}
                      withDots={false}
                      bezier
                      style={styles.chartOffset}
                    />
                  )}
                </ResponsiveChartContainer>
              )}
            </ErrorBoundary>
          </FadeInView>
        </View>

        {/* ── BOTTOM ROW ── */}
        <View style={isMobile ? styles.gridCol : styles.gridRow}>

          {/* Fingerprint Detection Grid */}
          <FadeInView delay={500} translateY={20} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, flex: isMobile ? 0 : 2 }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>AI Fingerprint Grid (15 Vectors)</Text>
            <ErrorBoundary>
              {isFpLoading ? (
                <View style={styles.fingerprintGrid}>
                  {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={80} width="47%" />)}
                </View>
              ) : (
                <View style={styles.fingerprintGrid}>
                  {fingerprints?.map((fp, i) => {
                    const statusColor = fp.status === 'red' ? theme.danger : fp.status === 'amber' ? theme.warning : theme.success;
                    const statusBg = fp.status === 'red' ? theme.dangerBg : fp.status === 'amber' ? theme.warningBg : theme.successBg;
                    const statusBorder = fp.status === 'red' ? theme.dangerBorder : fp.status === 'amber' ? theme.warningBorder : theme.successBorder;
                    return (
                      <View key={i} style={[styles.fpBox, { backgroundColor: statusBg, borderColor: statusBorder }]}>
                        <Text style={[styles.fpName, { color: statusColor }]}>{fp.name}</Text>
                        <Text style={[styles.fpEvidence, { color: theme.textSecondary }]}>{fp.evidence}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </ErrorBoundary>
          </FadeInView>

          {/* SHAP Explainability */}
          <FadeInView delay={600} translateY={20} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, flex: isMobile ? 0 : 1.2 }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>SHAP Explainability (Why 98%?)</Text>
            <ErrorBoundary>
              {isShapLoading ? renderSkeletonList(4, 25) : (
                <View style={styles.shapList}>
                  {shapData?.map((item, i) => (
                    <View key={i} style={styles.shapItem}>
                      <Text style={[styles.shapLabel, { color: theme.textSecondary }]}>{item.label}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={[styles.shapBarBg, { backgroundColor: theme.background }]}>
                          <View style={[styles.shapBarFill, { width: `${item.val}%`, backgroundColor: theme.primary }]} />
                        </View>
                        <Text style={[styles.shapValText, { color: theme.text }]}>{item.val}%</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ErrorBoundary>
          </FadeInView>
        </View>

        {/* ── 90-DAY CALENDAR OVERLAY ── */}
        <FadeInView delay={700} translateY={15} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>90-Day Inspection Calendar Overlay (PM₁₀)</Text>
          <Text style={[styles.chartSubText, { color: theme.textSecondary }]}>
            Red vertical markers indicate exact dates of CIS physical site visits.
          </Text>
          <ErrorBoundary>
            {isChartsLoading ? <Skeleton height={200} /> : (
              <View style={styles.overlayContainer}>
                <ResponsiveChartContainer minWidth={300}>
                  {(chartWidth) => (
                    <LineChart
                      data={chartsData!.calendar}
                      width={chartWidth}
                      height={200}
                      chartConfig={{
                        backgroundColor: theme.surface,
                        backgroundGradientFrom: theme.surface,
                        backgroundGradientTo: theme.surface,
                        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                        propsForBackgroundLines: { strokeDasharray: '', stroke: theme.border },
                      }}
                      bezier
                      style={{ marginLeft: -20 }}
                    />
                  )}
                </ResponsiveChartContainer>
                <View style={[styles.verticalMarker, { left: '30%' }]}>
                  <Text style={[styles.markerText, { color: theme.danger, backgroundColor: theme.dangerBg }]}>VISIT 1</Text>
                </View>
                <View style={[styles.verticalMarker, { left: '72%' }]}>
                  <Text style={[styles.markerText, { color: theme.danger, backgroundColor: theme.dangerBg }]}>VISIT 2</Text>
                </View>
              </View>
            )}
          </ErrorBoundary>
        </FadeInView>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentWrapper: {
    maxWidth: 1400,
    marginHorizontal: 'auto',
    padding: 40,
    width: '100%',
    gap: 24,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 },
  pageTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
  pageSub: { fontSize: 15, marginTop: 4, fontWeight: '600' },
  badgeRow: { flexDirection: 'row', gap: 12 },
  badge: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1 },
  badgeTextRed: { fontSize: 12, fontWeight: '900' },
  badgeTextAmber: { fontSize: 12, fontWeight: '900' },
  badgeTextGreen: { fontSize: 12, fontWeight: '900' },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  gridRow: { flexDirection: 'row', gap: 24 },
  gridCol: { flexDirection: 'column', gap: 16 },
  card: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: { fontSize: 18, fontWeight: '900', marginBottom: 20 },
  chartSubText: { fontSize: 12, marginBottom: 10 },
  chartOffset: { marginLeft: -10 },
  tabRow: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 8,
  },
  tab: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 6 },
  tabText: { fontSize: 12, fontWeight: '700' },
  leaderboardList: { gap: 16 },
  fingerprintGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  fpBox: { width: '47%', padding: 16, borderRadius: 10, borderWidth: 1 },
  fpName: { fontSize: 13, fontWeight: '900', marginBottom: 4 },
  fpEvidence: { fontSize: 11, fontWeight: '500' },
  shapList: { gap: 16 },
  shapItem: { gap: 6 },
  shapLabel: { fontSize: 13, fontWeight: '700' },
  shapBarBg: { flex: 1, height: 16, borderRadius: 4, overflow: 'hidden' },
  shapBarFill: { height: '100%', borderRadius: 4 },
  shapValText: { width: 35, fontSize: 12, fontWeight: '900' },
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
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});