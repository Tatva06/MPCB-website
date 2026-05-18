import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColor } from '../../../hooks/useThemeColor';
import { router } from 'expo-router';

export default function SystemLogsScreen() {
  const theme = useThemeColor();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Feather name="activity" size={48} color={theme.primary} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>System Logs Redirecting</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          The comprehensive activity logs are now integrated directly into the "All Reports" screen for easier unified auditing.
        </Text>
        <Pressable style={[styles.btn, { backgroundColor: theme.primary }]} onPress={() => router.push('/(dashboard)/admin/reports')}>
          <Text style={styles.btnText}>Go to Reports & Logs</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { maxWidth: 400, alignItems: 'center', padding: 20, textAlign: 'center' },
  iconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(59,130,246,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  subtitle: { fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 30 },
  btn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

import { Pressable } from 'react-native';
