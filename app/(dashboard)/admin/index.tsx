import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '../../../hooks/useThemeColor';

export default function AdminOverviewScreen() {
  const theme = useThemeColor();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Global System Overview</Text>
      <Text style={{ color: theme.textSecondary, marginTop: 10 }}>
        High-level global metrics across all regions will appear here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
});
