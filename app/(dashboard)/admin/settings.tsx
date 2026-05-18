import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColor } from '../../../hooks/useThemeColor';

export default function SystemSettingsScreen() {
  const theme = useThemeColor();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>System Settings</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Manage global system parameters and AI thresholds</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>AI Engine Configuration</Text>
          
          <View style={[styles.settingRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { color: theme.text }]}>Auto-Generate Enforcement Notices</Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>Automatically draft legal notices when SHAP score exceeds 85%</Text>
            </View>
            <Switch value={true} onValueChange={() => {}} trackColor={{ true: theme.primary }} />
          </View>

          <View style={[styles.settingRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { color: theme.text }]}>Real-time Sensor Sync (WebSockets)</Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>Pull CEMS telemetry data every 15 seconds instead of 5 minutes</Text>
            </View>
            <Switch value={false} onValueChange={() => {}} trackColor={{ true: theme.primary }} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>Security & Notifications</Text>
          
          <View style={[styles.settingRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { color: theme.text }]}>Strict Regional Isolation (RLS)</Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>Prevent Regional Managers from viewing factories outside their assigned jurisdiction</Text>
            </View>
            <Switch value={true} onValueChange={() => {}} trackColor={{ true: theme.primary }} />
          </View>

          <View style={[styles.settingRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { color: theme.text }]}>SMS Alerts for CRITICAL Anomalies</Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>Send SMS to the respective Regional Manager when AI detects Zero Variance</Text>
            </View>
            <Switch value={true} onValueChange={() => {}} trackColor={{ true: theme.primary }} />
          </View>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { maxWidth: 800, alignSelf: 'center', width: '100%', padding: 40, gap: 30 },
  header: { marginBottom: 10 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 4 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, marginLeft: 4 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 12, borderWidth: 1 },
  settingInfo: { flex: 1, paddingRight: 20 },
  settingName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  settingDesc: { fontSize: 13, lineHeight: 20 },
});
