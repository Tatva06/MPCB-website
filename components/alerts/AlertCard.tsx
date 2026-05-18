import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Alert } from '../../types';
import { useThemeColor } from '../../hooks/useThemeColor';

function AlertCard({ alert }: { alert: Alert }) {
  const [expanded, setExpanded] = useState(false);
  const theme = useThemeColor();

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return { color: theme.danger, bg: theme.dangerBg, border: theme.dangerBorder };
      case 'HIGH': return { color: theme.warning, bg: theme.warningBg, border: theme.warningBorder };
      case 'MEDIUM': return { color: '#eab308', bg: '#fefce8', border: '#fef08a' }; // keep medium fixed or add warning/info logic
      default: return { color: theme.textSecondary, bg: theme.border, border: theme.border };
    }
  };

  const severityStyle = getSeverityStyle(alert.severity);

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      style={[
        styles.alertCard,
        { backgroundColor: theme.surface, borderColor: theme.border, borderLeftColor: severityStyle.color }
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${alert.severity} alert for ${alert.factory}: ${alert.type}`}
      accessibilityState={{ expanded }}
    >
      {/* Header Row */}
      <View style={styles.alertHeader}>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={styles.alertTitleRow}>
            <Feather
              name={alert.severity === 'CRITICAL' ? 'alert-octagon' : 'alert-triangle'}
              size={15}
              color={severityStyle.color}
            />
            <Text style={[styles.alertFactory, { color: theme.text }]}>{alert.factory}</Text>
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: severityStyle.bg, borderColor: severityStyle.border },
              ]}
            >
              <Text style={[styles.severityText, { color: severityStyle.color }]}>
                {alert.severity}
              </Text>
            </View>
          </View>
          <Text style={[styles.alertType, { color: theme.textSecondary }]}>{alert.type}</Text>
          <View style={styles.alertMeta}>
            <Text style={[styles.alertMetaText, { color: theme.textSecondary }]}>{alert.cluster}</Text>
            <Text style={[styles.alertMetaDot, { color: theme.border }]}>·</Text>
            <Text style={[styles.alertMetaText, { color: theme.textSecondary }]}>{alert.time}</Text>
            <Text style={[styles.alertMetaDot, { color: theme.border }]}>·</Text>
            <Text style={[styles.alertMetaText, { color: theme.textSecondary }]}>{alert.parameter}</Text>
          </View>
        </View>

        <View style={styles.alertRight}>
          <Text style={styles.alertId}>{alert.id}</Text>
          <View
            style={[
              styles.shapBadge,
              { backgroundColor: alert.shapScore > 80 ? theme.dangerBg : theme.warningBg },
            ]}
          >
            <Text
              style={[
                styles.shapBadgeText,
                { color: alert.shapScore > 80 ? theme.danger : theme.warning },
              ]}
            >
              SHAP {alert.shapScore}%
            </Text>
          </View>
          <Feather
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={theme.textSecondary}
          />
        </View>
      </View>

      {/* Expanded Detail */}
      {expanded && (
        <View style={styles.alertDetail}>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Text style={styles.detailLabel}>FORENSIC DETAIL</Text>
          <Text style={[styles.detailText, { color: theme.text }]}>{alert.detail}</Text>

          <View style={styles.detailMetaRow}>
            <View style={[styles.detailMetaBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Text style={styles.detailMetaLabel}>Duration</Text>
              <Text style={[styles.detailMetaValue, { color: theme.text }]}>{alert.duration}</Text>
            </View>
            <View style={[styles.detailMetaBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Text style={styles.detailMetaLabel}>Parameter</Text>
              <Text style={[styles.detailMetaValue, { color: theme.text }]}>{alert.parameter}</Text>
            </View>
            <View style={[styles.detailMetaBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Text style={styles.detailMetaLabel}>Category</Text>
              <Text style={[styles.detailMetaValue, { color: theme.danger }]}>{alert.cid}</Text>
            </View>
          </View>

          <Text style={styles.detailLabel}>AI FINGERPRINTS TRIGGERED</Text>
          <View style={styles.fingerprintRow}>
            {alert.fingerprints.map((fp) => (
              <View key={fp} style={[styles.fpChip, { backgroundColor: theme.primaryBg, borderColor: theme.primaryBorder }]}>
                <Feather name="zap" size={10} color={theme.primary} />
                <Text style={[styles.fpChipText, { color: theme.primary }]}>{fp}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            <Pressable style={[styles.actionBtn, { backgroundColor: theme.primaryBg, borderColor: theme.primaryBorder }]}>
              <Feather name="eye" size={13} color={theme.primary} />
              <Text style={[styles.actionBtnText, { color: theme.primary }]}>View Raw Logs</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, { backgroundColor: theme.primaryBg, borderColor: theme.primaryBorder }]}>
              <Feather name="bar-chart-2" size={13} color={theme.primary} />
              <Text style={[styles.actionBtnText, { color: theme.primary }]}>SHAP Analysis</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, { backgroundColor: theme.dangerBg, borderColor: theme.dangerBorder }]}>
              <Feather name="file-text" size={13} color={theme.danger} />
              <Text style={[styles.actionBtnText, { color: theme.danger }]}>Issue Notice</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Pressable>
  );
}

export default React.memo(AlertCard);

const styles = StyleSheet.create({
  alertCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  alertTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  alertFactory: { fontSize: 15, fontWeight: '800', flex: 1 },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  severityText: { fontSize: 10, fontWeight: '800' },
  alertType: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  alertMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  alertMetaText: { fontSize: 11 },
  alertMetaDot: { fontSize: 11, marginHorizontal: 2 },
  alertRight: { alignItems: 'flex-end', gap: 6 },
  alertId: { fontSize: 10, color: '#94a3b8', fontWeight: '600', fontFamily: 'monospace' },
  shapBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  shapBadgeText: { fontSize: 10, fontWeight: '800' },
  alertDetail: { paddingHorizontal: 16, paddingBottom: 16 },
  divider: { height: 1, marginBottom: 14 },
  detailLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 12,
  },
  detailText: { fontSize: 13, lineHeight: 22 },
  detailMetaRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  detailMetaBox: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
  },
  detailMetaLabel: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  detailMetaValue: { fontSize: 14, fontWeight: '800' },
  fingerprintRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 4 },
  fpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  fpChipText: { fontSize: 11, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 16, flexWrap: 'wrap' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionBtnText: { fontSize: 12, fontWeight: '600' },
});
