import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FactoryLeaderboard } from '../../types';
import { useThemeColor } from '../../hooks/useThemeColor';

function LeaderboardItem({ factory }: { factory: FactoryLeaderboard }) {
  const theme = useThemeColor();

  return (
    <Pressable
      style={styles.leaderboardItem}
      onPress={() => router.push('/(dashboard)/factory-detail')}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${factory.name}, Tamper score ${factory.score}%`}
    >
      <View style={styles.leaderboardTextRow}>
        <Text style={[styles.factoryName, { color: theme.text }]}>{factory.name}</Text>
        <Text style={[styles.factoryScore, { color: factory.color }]}>
          {factory.score}%
        </Text>
      </View>
      <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${factory.score}%`, backgroundColor: factory.color },
          ]}
        />
      </View>
    </Pressable>
  );
}

export default React.memo(LeaderboardItem);

const styles = StyleSheet.create({
  leaderboardItem: { gap: 6 },
  leaderboardTextRow: { flexDirection: 'row', justifyContent: 'space-between' },
  factoryName: { fontSize: 14, fontWeight: '700' },
  factoryScore: { fontSize: 14, fontWeight: '900' },
  progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
});
