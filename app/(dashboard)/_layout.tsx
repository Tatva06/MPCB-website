import { Feather } from '@expo/vector-icons';
import { Slot, router, usePathname } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { user, isLoading, logout } = useAuth();

  // Role-based redirect gate
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/');
    }
  }, [user, isLoading]);

  if (isLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Verifying credentials...</Text>
      </View>
    );
  }

  const isActive = (path: string) => pathname === path;

  // Role-based nav items
  const getNavItems = () => {
    const common = [
      { label: 'Live Telemetry', icon: 'activity', path: '/(dashboard)' },
      { label: 'Tamper Alerts', icon: 'alert-triangle', path: '/(dashboard)/alerts' },
    ];

    if (user.role === 'superadmin') {
      return {
        monitoring: [
          { label: 'Global Overview', icon: 'globe', path: '/(dashboard)/admin' },
        ],
        actions: [],
        management: [
          { label: 'User Management', icon: 'users', path: '/(dashboard)/admin/users' },
          { label: 'All Reports', icon: 'clipboard', path: '/(dashboard)/admin/reports' },
          { label: 'System Logs', icon: 'activity', path: '/(dashboard)/admin/logs' },
          { label: 'System Settings', icon: 'settings', path: '/(dashboard)/admin/settings' },
        ],
      };
    }

    if (user.role === 'regional_manager') {
      return {
        monitoring: [
          { label: 'Region Overview', icon: 'map', path: '/(dashboard)/regional' },
        ],
        actions: [],
        management: [
          { label: 'My Auditors', icon: 'users', path: '/(dashboard)/regional/auditors' },
          { label: 'Region Reports', icon: 'clipboard', path: '/(dashboard)/admin/reports' },
        ],
      };
    }

    // auditor
    return {
      monitoring: [
        { label: 'My Factories', icon: 'activity', path: '/(dashboard)/auditor' },
        { label: 'My Alerts', icon: 'alert-triangle', path: '/(dashboard)/auditor/alerts' },
      ],
      actions: [
        { label: 'Submit Report', icon: 'file-text', path: '/(dashboard)/auditor/report' },
      ],
      management: [],
    };
  };

  const navItems = getNavItems();

  const roleLabel = {
    superadmin: 'Super Admin',
    regional_manager: 'Regional Manager',
    auditor: 'Auditor',
  }[user.role];

  const roleColor = {
    superadmin: '#f59e0b',
    regional_manager: '#8b5cf6',
    auditor: '#3b82f6',
  }[user.role];

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.location.href = '/';
      } else {
        router.replace('/');
      }
    }
  };

  const NavButton = ({ item }: { item: { label: string; icon: string; path: string } }) => {
    const active = isActive(item.path);
    return (
      <Pressable
        onPress={() => router.push(item.path as any)}
        style={[styles.navItem, active && styles.navItemActive]}
      >
        <Feather name={item.icon as any} size={18} color={active ? '#60a5fa' : '#94a3b8'} />
        <Text style={[styles.navText, active && styles.navTextActive]}>{item.label}</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { flexDirection: isMobile ? 'column' : 'row' }]}>

        {/* ── DESKTOP SIDEBAR ── */}
        {!isMobile && (
          <View style={styles.sidebar}>
            {/* Brand */}
            <View style={styles.brandContainer}>
              <Feather name="shield" size={28} color="#3b82f6" />
              <Text style={styles.brandTitle}>ForensiAir</Text>
            </View>

            {/* Role Badge */}
            <View style={[styles.roleBadge, { backgroundColor: `${roleColor}18`, borderColor: `${roleColor}40` }]}>
              <View style={[styles.roleDot, { backgroundColor: roleColor }]} />
              <Text style={[styles.roleText, { color: roleColor }]}>{roleLabel}</Text>
            </View>

            {/* SECTION 1: MONITORING */}
            <View style={styles.navSection}>
              <Text style={styles.navHeader}>REAL-TIME MONITORING</Text>
              {navItems.monitoring.map((item) => <NavButton key={item.path} item={item} />)}
            </View>

            {/* SECTION 2: ACTIONS */}
            {navItems.actions.length > 0 && (
              <View style={styles.navSection}>
                <Text style={styles.navHeader}>REGULATORY ACTIONS</Text>
                {navItems.actions.map((item) => <NavButton key={item.path} item={item} />)}
              </View>
            )}

            {/* SECTION 3: MANAGEMENT (superadmin / regional_manager only) */}
            {navItems.management.length > 0 && (
              <View style={styles.navSection}>
                <Text style={styles.navHeader}>MANAGEMENT</Text>
                {navItems.management.map((item) => <NavButton key={item.path} item={item} />)}
              </View>
            )}

            <View style={{ flex: 1 }} />

            {/* User Profile */}
            <View style={styles.profileBox}>
              <View style={[styles.avatar, { backgroundColor: roleColor }]}>
                <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.profileName} numberOfLines={1}>{user.name}</Text>
                <Text style={styles.profileOfficerId}>{user.officerId}</Text>
              </View>
            </View>

            {/* Logout */}
            <Pressable style={styles.logoutBtn} onPress={handleLogout}>
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
            {navItems.monitoring.slice(0, 2).map((item) => (
              <Pressable key={item.path} onPress={() => router.push(item.path as any)} style={styles.mobileNavItem}>
                <Feather name={item.icon as any} size={24} color={isActive(item.path) ? '#60a5fa' : '#94a3b8'} />
              </Pressable>
            ))}
            {navItems.actions.slice(0, 1).map((item) => (
              <Pressable key={item.path} onPress={() => router.push(item.path as any)} style={styles.mobileNavItem}>
                <Feather name={item.icon as any} size={24} color={isActive(item.path) ? '#60a5fa' : '#94a3b8'} />
              </Pressable>
            ))}
            {user.role !== 'auditor' && (
              <Pressable onPress={() => router.push('/(dashboard)/admin/users' as any)} style={styles.mobileNavItem}>
                <Feather name="users" size={24} color="#94a3b8" />
              </Pressable>
            )}
            <Pressable style={styles.mobileNavItem} onPress={handleLogout}>
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
  loadingContainer: { flex: 1, backgroundColor: '#0b1120', justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: '#94a3b8', fontSize: 14 },
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
    marginBottom: 20,
    gap: 10,
  },
  brandTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 28,
  },
  roleDot: { width: 8, height: 8, borderRadius: 4 },
  roleText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  navSection: { marginBottom: 28 },
  navHeader: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: 1.5,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  navText: { color: '#94a3b8', fontSize: 14, fontWeight: '600', marginLeft: 12 },
  navTextActive: { color: '#60a5fa', fontWeight: '800' },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  profileName: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  profileOfficerId: { color: '#64748b', fontSize: 11, marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
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