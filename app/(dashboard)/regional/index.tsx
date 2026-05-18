import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View, Pressable } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useQuery } from '@tanstack/react-query';
import { FadeInView } from '../../../components/common/FadeInView';
import LeaderboardItem from '../../../components/dashboard/LeaderboardItem';
import MetricCard from '../../../components/dashboard/MetricCard';
import ResponsiveChartContainer from '../../../components/common/ResponsiveChartContainer';
import Skeleton from '../../../components/common/Skeleton';
import { ErrorBoundary } from '../../../components/common/ErrorBoundary';
import { getChartsData, getDashboardMetrics, getLeaderboard, getShapData } from '../../../services/api';
import { useThemeColor } from '../../../hooks/useThemeColor';

export default function RegionalOverviewScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const theme = useThemeColor();
  const [activeParam, setActiveParam] = useState('SO2');

  const { data: metrics, isLoading: isMetricsLoading } = useQuery({ queryKey: ['reg_metrics'], queryFn: getDashboardMetrics });
  const { data: leaderboard, isLoading: isLeaderboardLoading } = useQuery({ queryKey: ['reg_leaderboard'], queryFn: getLeaderboard });
  const { data: shapData, isLoading: isShapLoading } = useQuery({ queryKey: ['reg_shap'], queryFn: getShapData });
  const { data: chartsData, isLoading: isChartsLoading } = useQuery({ queryKey: ['reg_charts'], queryFn: getChartsData });

  const renderSkeletonList = (count: number, height: number) => (
    <View style={{ gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => <Skeleton key={i} height={height} borderRadius={8} />)}
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.contentWrapper}>

        <FadeInView delay={100} translateY={-10}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.pageTitle, { color: theme.text }]}>Taloja Region Overview</Text>
              <Text style={[styles.pageSub, { color: theme.textSecondary }]}>Monitoring Taloja MIDC Industrial Area</Text>
            </View>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: theme.warningBg, borderColor: theme.warningBorder }]}>
                <Text style={[styles.badgeTextYellow, { color: theme.warning }]}>ELEVATED RISK LEVEL</Text>
              </View>
            </View>
          </View>
        </FadeInView>

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
              metrics?.map((metric, i) => <MetricCard key={i} metric={{ ...metric, label: metric.label.replace('Global', 'Regional') }} />)
            )}
          </View>
        </FadeInView>

        <View style={isMobile ? styles.gridCol : styles.gridRow}>
          <FadeInView delay={300} translateY={15} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, flex: isMobile ? 0 : 1.2 }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>All Factories in Region</Text>
            <ErrorBoundary>
              {isLeaderboardLoading ? renderSkeletonList(5, 30) : (
                <View style={styles.leaderboardList}>
                  {leaderboard?.map((factory, i) => <LeaderboardItem key={i} factory={factory} />)}
                </View>
              )}
            </ErrorBoundary>
          </FadeInView>

          <FadeInView delay={400} translateY={15} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, flex: isMobile ? 0 : 2 }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Regional Tamper Alerts Trend</Text>
              <View style={[styles.tabRow, { backgroundColor: theme.background }]}>
                {['SO2', 'NOX', 'PM10'].map((param) => (
                  <Pressable key={param} onPress={() => setActiveParam(param)} style={[styles.tab, activeParam === param && { backgroundColor: theme.surface }]}>
                    <Text style={[styles.tabText, { color: theme.textSecondary }, activeParam === param && { color: theme.primary }]}>{param}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <Text style={[styles.chartSubText, { color: theme.textSecondary }]}>Aggregate anomalies across all 152 nodes in Navi Mumbai</Text>
            <ErrorBoundary>
              {isChartsLoading ? <Skeleton height={220} /> : (
                <ResponsiveChartContainer minWidth={280}>
                  {(chartWidth) => (
                    <LineChart
                      data={chartsData!.timeline} width={chartWidth} height={220}
                      chartConfig={{ backgroundColor: theme.surface, backgroundGradientFrom: theme.surface, backgroundGradientTo: theme.surface, color: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`, strokeWidth: 2, propsForBackgroundLines: { strokeDasharray: '', stroke: theme.border } }}
                      withDots={false} bezier style={styles.chartOffset}
                    />
                  )}
                </ResponsiveChartContainer>
              )}
            </ErrorBoundary>
          </FadeInView>
        </View>

        <View style={isMobile ? styles.gridCol : styles.gridRow}>
          <FadeInView delay={600} translateY={20} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, flex: isMobile ? 0 : 1 }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Regional Inspection Success</Text>
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
          
          <FadeInView delay={700} translateY={20} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, flex: isMobile ? 0 : 1 }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Auditor Performance (Last 30 Days)</Text>
            <View style={{ gap: 16 }}>
              {[
                { name: 'Sanjay Patil (AUD-01)', completed: 12, pending: 2 },
                { name: 'Rahul Desai (AUD-02)', completed: 8, pending: 5 },
                { name: 'Vikram Singh (AUD-03)', completed: 14, pending: 0 },
                { name: 'Anita Kulkarni (AUD-04)', completed: 9, pending: 1 }
              ].map((aud, i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: theme.text, fontWeight: '600' }}>{aud.name}</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                    <Text style={{ color: theme.success, fontWeight: '700' }}>{aud.completed}</Text> done / <Text style={{ color: theme.warning, fontWeight: '700' }}>{aud.pending}</Text> pending
                  </Text>
                </View>
              ))}
            </View>
          </FadeInView>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentWrapper: { maxWidth: 1400, marginHorizontal: 'auto', padding: 40, width: '100%', gap: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 },
  pageTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
  pageSub: { fontSize: 15, marginTop: 4, fontWeight: '600' },
  badgeRow: { flexDirection: 'row', gap: 12 },
  badge: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1 },
  badgeTextYellow: { fontSize: 12, fontWeight: '900' },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  gridRow: { flexDirection: 'row', gap: 24 },
  gridCol: { flexDirection: 'column', gap: 16 },
  card: { padding: 24, borderRadius: 16, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 18, fontWeight: '900', marginBottom: 20 },
  chartSubText: { fontSize: 12, marginBottom: 10 },
  chartOffset: { marginLeft: -10 },
  tabRow: { flexDirection: 'row', padding: 4, borderRadius: 8 },
  tab: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 6 },
  tabText: { fontSize: 12, fontWeight: '700' },
  leaderboardList: { gap: 16 },
  shapList: { gap: 16 },
  shapItem: { gap: 6 },
  shapLabel: { fontSize: 13, fontWeight: '700' },
  shapBarBg: { flex: 1, height: 16, borderRadius: 4, overflow: 'hidden' },
  shapBarFill: { height: '100%', borderRadius: 4 },
  shapValText: { width: 35, fontSize: 12, fontWeight: '900' },
});
