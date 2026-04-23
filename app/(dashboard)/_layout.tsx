import { Feather } from '@expo/vector-icons';
import { Slot, router, usePathname } from 'expo-router';
import React from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

export default function DashboardLayout() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // FIX: use exact route paths that expo-router resolves correctly
  const isActive = (path: string) => pathname === path;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { flexDirection: isMobile ? 'column' : 'row' }]}>

        {/* ── DESKTOP SIDEBAR ── */}
        {!isMobile && (
          <View style={styles.sidebar}>
            <View style={styles.brandContainer}>
              <Feather name="shield" size={28} color="#3b82f6" />
              <Text style={styles.brandTitle}>MPCB AI-AUDIT</Text>
            </View>

            {/* SECTION 1: REAL-TIME MONITORING */}
            <View style={styles.navSection}>
              <Text style={styles.navHeader}>REAL-TIME MONITORING</Text>

              {/* FIX: push to '/' resolves to index inside (dashboard) group */}
              <Pressable
                onPress={() => router.push('/')}
                style={[styles.navItem, isActive('/') && styles.navItemActive]}
              >
                <Feather name="activity" size={18} color={isActive('/') ? '#60a5fa' : '#94a3b8'} />
                <Text style={[styles.navText, isActive('/') && styles.navTextActive]}>Live Telemetry</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/(dashboard)/alerts')}
                style={[styles.navItem, isActive('/alerts') && styles.navItemActive]}
              >
                <Feather name="alert-triangle" size={18} color={isActive('/alerts') ? '#60a5fa' : '#94a3b8'} />
                <Text style={[styles.navText, isActive('/alerts') && styles.navTextActive]}>Tamper Alerts</Text>
              </Pressable>

              <Pressable style={styles.navItem}>
                <Feather name="wind" size={18} color="#94a3b8" />
                <Text style={styles.navText}>Air Quality (CEMS)</Text>
              </Pressable>

              <Pressable style={styles.navItem}>
                <Feather name="droplet" size={18} color="#94a3b8" />
                <Text style={styles.navText}>Effluent (ETP)</Text>
              </Pressable>
            </View>

            {/* SECTION 2: REGULATORY ACTIONS */}
            <View style={styles.navSection}>
              <Text style={styles.navHeader}>REGULATORY ACTIONS</Text>

              {/* FIX: Added report route */}
              <Pressable
                onPress={() => router.push('/(dashboard)/report')}
                style={[styles.navItem, isActive('/report') && styles.navItemActive]}
              >
                <Feather name="file-text" size={18} color={isActive('/report') ? '#60a5fa' : '#94a3b8'} />
                <Text style={[styles.navText, isActive('/report') && styles.navTextActive]}>
                  Compliance Report
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/modal')}
                style={styles.navItem}
              >
                <Feather name="download" size={18} color="#94a3b8" />
                <Text style={styles.navText}>Generate Legal Notice</Text>
              </Pressable>
            </View>

            <View style={{ flex: 1 }} />

            {/* User Profile */}
            <View style={styles.profileBox}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>T</Text>
              </View>
              <View>
                <Text style={styles.profileName}>Tatva</Text>
                <Text style={styles.profileRole}>Chief Auditor</Text>
              </View>
            </View>

            {/* Logout */}
            <Pressable style={styles.logoutBtn} onPress={() => router.replace('/')}>
              <Feather name="log-out" size={18} color="#ef4444" />
              <Text style={styles.logoutText}>Secure Logout</Text>
            </Pressable>
          </View>
        )}

        {/* ── DYNAMIC CONTENT AREA ── */}
        <View style={styles.mainContent}>
          <Slot />
        </View>

        {/* ── MOBILE BOTTOM NAVIGATION ── */}
        {isMobile && (
          <View style={styles.bottomNav}>
            <Pressable
              onPress={() => router.push('/')}
              style={styles.mobileNavItem}
            >
              <Feather name="activity" size={24} color={isActive('/') ? '#60a5fa' : '#94a3b8'} />
            </Pressable>

            <Pressable
              onPress={() => router.push('/(dashboard)/alerts')}
              style={styles.mobileNavItem}
            >
              <Feather name="alert-triangle" size={24} color={isActive('/alerts') ? '#60a5fa' : '#94a3b8'} />
            </Pressable>

            <Pressable
              onPress={() => router.push('/(dashboard)/report')}
              style={styles.mobileNavItem}
            >
              <Feather name="file-text" size={24} color={isActive('/report') ? '#60a5fa' : '#94a3b8'} />
            </Pressable>

            <Pressable
              onPress={() => router.push('/modal')}
              style={styles.mobileNavItem}
            >
              <Feather name="download" size={24} color="#94a3b8" />
            </Pressable>

            <Pressable style={styles.mobileNavItem} onPress={() => router.replace('/')}>
              <Feather name="log-out" size={24} color="#ef4444" />
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0b1120' },
  container: { flex: 1, backgroundColor: '#f4f7f9' },
  sidebar: {
    width: 260,
    backgroundColor: '#0b1120',
    padding: 24,
    borderRightWidth: 1,
    borderRightColor: '#1e293b',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 10,
  },
  brandTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  navSection: { marginBottom: 32 },
  navHeader: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 16,
    letterSpacing: 1.5,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
  },
  navItemActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  navText: { color: '#94a3b8', fontSize: 14, fontWeight: '600', marginLeft: 14 },
  navTextActive: { color: '#60a5fa', fontWeight: '800' },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  profileName: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  profileRole: { color: '#94a3b8', fontSize: 12 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
  },
  logoutText: { color: '#ef4444', fontWeight: 'bold', marginLeft: 10 },
  mainContent: { flex: 1, overflow: 'hidden' },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0b1120',
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  mobileNavItem: { paddingHorizontal: 14, paddingVertical: 8 },
});