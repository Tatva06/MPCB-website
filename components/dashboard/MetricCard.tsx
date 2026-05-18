import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MetricData } from '../../types';
import { useThemeColor } from '../../hooks/useThemeColor';

function MetricCard({ metric }: { metric: MetricData }) {
  const theme = useThemeColor();
  
  return (
    <View style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>{metric.label}</Text>
      <View style={styles.metricValueRow}>
        <Text style={[styles.metricValue, { color: theme.text }]}>{metric.value}</Text>
        <Text style={[styles.metricTrend, { color: metric.trend.startsWith('-') ? theme.success : theme.danger }]}>
          {metric.trend}
        </Text>
      </View>
    </View>
  );
}

export default React.memo(MetricCard);

const styles = StyleSheet.create({
  metricCard: {
    flex: 1,
    minWidth: 140,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 12 },
  metricValue: { fontSize: 32, fontWeight: '900' },
  metricTrend: { fontWeight: 'bold', fontSize: 14 },
});
