import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function BlockedScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Feather name="shield-off" size={64} color="#ef4444" style={styles.icon} />
        <Text style={styles.title}>Access Denied</Text>
        <Text style={styles.message}>
          For security reasons, access to the MPCB ForensiAir system is strictly limited to authorized IP addresses within India.
        </Text>
        <Text style={styles.subMessage}>
          If you are an authorized official, please disconnect your VPN or contact the central IT administration.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1120',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    maxWidth: 400,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  subMessage: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  }
});
