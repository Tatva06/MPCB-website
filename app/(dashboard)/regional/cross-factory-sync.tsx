import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColor } from '../../../hooks/useThemeColor';

export default function PlaceholderScreen() {
  const theme = useThemeColor();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.iconBox}>
        <Feather name="layers" size={48} color={theme.primary} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>Feature Coming Soon</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        This module is currently being integrated with the PollutionGuard backend. 
        It will be available for Regional Managers in the v0.2 release.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  iconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(59,130,246,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  subtitle: { fontSize: 14, lineHeight: 22, textAlign: 'center', maxWidth: 400 },
});
