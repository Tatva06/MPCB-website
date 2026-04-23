import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function RawDataModal() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View style={styles.overlay}>
      <View style={[styles.modalContent, { width: isMobile ? '90%' : 600 }]}>
        
        {/* Modal Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Feather name="database" size={20} color="#0f172a" />
            <Text style={styles.title}>Raw Telemetry Logs</Text>
          </View>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Feather name="x" size={20} color="#64748b" />
          </Pressable>
        </View>

        <Text style={styles.subText}>Target: Deepak Fertilizers (SO2 / NOX Sensors)</Text>

        {/* The "Hacker" Terminal Box */}
        <ScrollView style={styles.logBox}>
          <Text style={styles.codeText}>
            [12:00:01] INFO  : SO2: 140.00 ppm | NOX: 45.2 ppm{"\n"}
            [12:05:01] INFO  : SO2: 140.00 ppm | NOX: 46.1 ppm{"\n"}
            [12:10:01] INFO  : SO2: 140.00 ppm | NOX: 44.8 ppm{"\n"}
            [12:15:01] WARN  : SO2: 140.00 ppm | NOX: 45.9 ppm{"\n"}
            [12:20:01] WARN  : SO2: 140.00 ppm | NOX: 45.3 ppm{"\n"}
            ======================================{"\n"}
            {'>>>'} AI_FLAG: VARIANCE_ZERO_DETECTED{"\n"}
            {'>>>'} SHAP_SCORE: 98.4% CONFIDENCE{"\n"}
            ======================================{"\n"}
          </Text>
        </ScrollView>

        {/* PDF Generator Trigger */}
        <Pressable style={styles.exportBtn} onPress={() => alert('PDF Enforcement Notice Generated!')}>
          <Feather name="file-text" size={16} color="#fff" />
          <Text style={styles.exportText}>Generate Legal PDF Notice</Text>
        </Pressable>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  closeBtn: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 8 },
  subText: { color: '#64748b', fontSize: 14, marginBottom: 20, fontWeight: '500' },
  logBox: { backgroundColor: '#020617', padding: 16, borderRadius: 12, height: 250, marginBottom: 20 },
  codeText: { fontFamily: 'monospace', color: '#10b981', fontSize: 13, lineHeight: 22 },
  exportBtn: { backgroundColor: '#ef4444', padding: 16, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  exportText: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});