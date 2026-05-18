import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, Modal, ActivityIndicator, useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../context/AuthContext';
import { router } from 'expo-router';
import { UserRole } from '../../../types';

interface Officer {
  id: string;
  officer_id: string;
  role: UserRole;
  full_name: string;
  region: string | null;
  created_at: string;
}

const ROLE_COLORS: Record<UserRole, string> = {
  superadmin: '#f59e0b',
  regional_manager: '#8b5cf6',
  auditor: '#3b82f6',
};

const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  regional_manager: 'Regional Manager',
  auditor: 'Auditor',
};

export default function UserManagementScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  // New user form state
  const [newOfficerId, setNewOfficerId] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('auditor');
  const [newRegion, setNewRegion] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Redirect if not superadmin
  useEffect(() => {
    if (user && user.role !== 'superadmin') {
      router.replace('/(dashboard)');
    }
  }, [user]);

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setOfficers(data as Officer[]);
    setLoading(false);
  };

  const handleAddOfficer = async () => {
    if (!newOfficerId.trim() || !newFullName.trim() || !newPassword.trim()) {
      setError('Officer ID, Full Name, and Password are required.');
      return;
    }
    const idRegex = /^[A-Za-z0-9-]+$/;
    if (!idRegex.test(newOfficerId.trim())) {
      setError('Officer ID can only contain letters, numbers, and hyphens.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setActionLoading(true);
    setError('');

    const email = `${newOfficerId.trim().toLowerCase()}@mpcb.gov.in`;

    // Note: Creating auth users requires service_role key - this creates a profile entry
    // In production, use a Supabase Edge Function with service_role key
    // For now, insert profile — SuperAdmin creates auth user in Supabase dashboard
    const { error: profileError } = await supabase.from('profiles').insert({
      id: crypto.randomUUID(), // Will be replaced once auth user is created
      officer_id: newOfficerId.trim().toUpperCase(),
      role: newRole,
      full_name: newFullName.trim(),
      region: newRegion.trim() || null,
    });

    if (profileError) {
      setError('Create the auth user in Supabase dashboard first with email: ' + email);
    } else {
      setShowAddModal(false);
      resetForm();
      fetchOfficers();
    }

    setActionLoading(false);
  };

  const handleDeleteOfficer = async (officerId: string, profileId: string) => {
    if (officerId === user?.officerId) {
      setError("You cannot delete your own account.");
      return;
    }
    setActionLoading(true);
    await supabase.from('profiles').delete().eq('id', profileId);
    fetchOfficers();
    setActionLoading(false);
  };

  const handleChangeRole = async (profileId: string, currentRole: UserRole) => {
    const roles: UserRole[] = ['auditor', 'regional_manager', 'superadmin'];
    const nextRole = roles[(roles.indexOf(currentRole) + 1) % roles.length];
    await supabase.from('profiles').update({ role: nextRole }).eq('id', profileId);
    fetchOfficers();
  };

  const resetForm = () => {
    setNewOfficerId('');
    setNewFullName('');
    setNewRole('auditor');
    setNewRegion('');
    setNewPassword('');
    setError('');
  };

  const filteredOfficers = officers.filter((o) => {
    const matchSearch =
      o.officer_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = filterRole === 'all' || o.role === filterRole;
    return matchSearch && matchRole;
  });

  const stats = {
    total: officers.length,
    superadmins: officers.filter((o) => o.role === 'superadmin').length,
    regional: officers.filter((o) => o.role === 'regional_manager').length,
    auditors: officers.filter((o) => o.role === 'auditor').length,
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.content, { padding: isMobile ? 20 : 40 }]}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>User Management</Text>
            <Text style={styles.subtitle}>Manage all officers and their access levels</Text>
          </View>
          <Pressable style={styles.addBtn} onPress={() => setShowAddModal(true)}>
            <Feather name="user-plus" size={16} color="#fff" />
            <Text style={styles.addBtnText}>Add Officer</Text>
          </Pressable>
        </View>

        {/* Stats Row */}
        <View style={[styles.statsRow, isMobile && { flexWrap: 'wrap' }]}>
          {[
            { label: 'Total Officers', value: stats.total, color: '#3b82f6', icon: 'users' },
            { label: 'Super Admins', value: stats.superadmins, color: '#f59e0b', icon: 'shield' },
            { label: 'Regional Managers', value: stats.regional, color: '#8b5cf6', icon: 'map-pin' },
            { label: 'Auditors', value: stats.auditors, color: '#10b981', icon: 'clipboard' },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statCard, isMobile && { width: '47%' }]}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                <Feather name={stat.icon as any} size={18} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Search & Filter */}
        <View style={[styles.filterRow, isMobile && { flexDirection: 'column' }]}>
          <View style={styles.searchBox}>
            <Feather name="search" size={16} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or Officer ID..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View style={styles.roleFilterRow}>
            {['all', 'superadmin', 'regional_manager', 'auditor'].map((role) => (
              <Pressable
                key={role}
                style={[styles.filterBtn, filterRole === role && styles.filterBtnActive]}
                onPress={() => setFilterRole(role)}
              >
                <Text style={[styles.filterBtnText, filterRole === role && styles.filterBtnTextActive]}>
                  {role === 'all' ? 'All' : role === 'regional_manager' ? 'Regional' : role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Feather name="alert-triangle" size={14} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Officers Table */}
        <View style={styles.tableCard}>
          {loading ? (
            <ActivityIndicator size="large" color="#3b82f6" style={{ padding: 40 }} />
          ) : filteredOfficers.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="users" size={40} color="#334155" />
              <Text style={styles.emptyText}>No officers found</Text>
            </View>
          ) : (
            filteredOfficers.map((officer) => (
              <View key={officer.id} style={styles.officerRow}>
                <View style={[styles.officerAvatar, { backgroundColor: `${ROLE_COLORS[officer.role]}25` }]}>
                  <Text style={[styles.officerAvatarText, { color: ROLE_COLORS[officer.role] }]}>
                    {officer.full_name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.officerInfo}>
                  <Text style={styles.officerName}>{officer.full_name}</Text>
                  <Text style={styles.officerId}>{officer.officer_id}</Text>
                  {officer.region && <Text style={styles.officerRegion}>📍 {officer.region}</Text>}
                </View>
                <View style={[styles.rolePill, { backgroundColor: `${ROLE_COLORS[officer.role]}20`, borderColor: `${ROLE_COLORS[officer.role]}40` }]}>
                  <Text style={[styles.rolePillText, { color: ROLE_COLORS[officer.role] }]}>
                    {ROLE_LABELS[officer.role]}
                  </Text>
                </View>
                <View style={styles.officerActions}>
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => handleChangeRole(officer.id, officer.role)}
                  >
                    <Feather name="refresh-cw" size={14} color="#94a3b8" />
                  </Pressable>
                  {officer.officer_id !== user?.officerId && (
                    <Pressable
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() => handleDeleteOfficer(officer.officer_id, officer.id)}
                    >
                      <Feather name="trash-2" size={14} color="#ef4444" />
                    </Pressable>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Add Officer Modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Officer</Text>
              <Pressable onPress={() => { setShowAddModal(false); resetForm(); }}>
                <Feather name="x" size={20} color="#94a3b8" />
              </Pressable>
            </View>

            <Text style={styles.modalNote}>
              ⚠️ First create the auth user in Supabase Dashboard with email:{'\n'}
              <Text style={{ color: '#60a5fa' }}>{newOfficerId ? `${newOfficerId.toLowerCase()}@mpcb.gov.in` : 'officerId@mpcb.gov.in'}</Text>
            </Text>

            {[
              { label: 'Officer ID (e.g. MPCB-FI-02)', value: newOfficerId, set: setNewOfficerId, caps: true },
              { label: 'Full Name', value: newFullName, set: setNewFullName, caps: false },
              { label: 'Region (optional)', value: newRegion, set: setNewRegion, caps: false },
              { label: 'Password (min 8 chars)', value: newPassword, set: setNewPassword, caps: false, secure: true },
            ].map((field) => (
              <View key={field.label} style={styles.modalField}>
                <Text style={styles.modalLabel}>{field.label}</Text>
                <TextInput
                  style={styles.modalInput}
                  value={field.value}
                  onChangeText={field.set}
                  autoCapitalize={field.caps ? 'characters' : 'words'}
                  secureTextEntry={field.secure}
                  placeholderTextColor="#475569"
                />
              </View>
            ))}

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Role</Text>
              <View style={styles.rolePickerRow}>
                {(['auditor', 'regional_manager', 'superadmin'] as UserRole[]).map((role) => (
                  <Pressable
                    key={role}
                    style={[styles.rolePicker, newRole === role && { backgroundColor: `${ROLE_COLORS[role]}25`, borderColor: `${ROLE_COLORS[role]}60` }]}
                    onPress={() => setNewRole(role)}
                  >
                    <Text style={[styles.rolePickerText, newRole === role && { color: ROLE_COLORS[role] }]}>
                      {ROLE_LABELS[role]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={[styles.modalSubmitBtn, actionLoading && { opacity: 0.6 }]}
              onPress={handleAddOfficer}
              disabled={actionLoading}
            >
              {actionLoading ? <ActivityIndicator color="#fff" size="small" /> : (
                <Text style={styles.modalSubmitText}>Add Officer</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { maxWidth: 1200, alignSelf: 'center', width: '100%', gap: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 28, fontWeight: '900', color: '#f1f5f9' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 16 },
  statCard: { flex: 1, backgroundColor: '#1e293b', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#334155', gap: 8 },
  statIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '900', color: '#f1f5f9' },
  statLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  filterRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1e293b', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#334155' },
  searchInput: { flex: 1, color: '#f1f5f9', fontSize: 14 },
  roleFilterRow: { flexDirection: 'row', gap: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  filterBtnActive: { backgroundColor: 'rgba(59,130,246,0.2)', borderColor: 'rgba(59,130,246,0.5)' },
  filterBtnText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  filterBtnTextActive: { color: '#60a5fa' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 8, padding: 12 },
  errorText: { color: '#ef4444', fontSize: 13, flex: 1 },
  tableCard: { backgroundColor: '#1e293b', borderRadius: 16, borderWidth: 1, borderColor: '#334155', overflow: 'hidden' },
  officerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18, borderBottomWidth: 1, borderBottomColor: '#0f172a' },
  officerAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  officerAvatarText: { fontSize: 18, fontWeight: '800' },
  officerInfo: { flex: 1 },
  officerName: { color: '#f1f5f9', fontSize: 15, fontWeight: '700' },
  officerId: { color: '#64748b', fontSize: 12, marginTop: 2, fontFamily: 'monospace' },
  officerRegion: { color: '#475569', fontSize: 11, marginTop: 2 },
  rolePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  rolePillText: { fontSize: 12, fontWeight: '700' },
  officerActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)' },
  deleteBtn: { backgroundColor: 'rgba(239,68,68,0.1)' },
  emptyState: { padding: 60, alignItems: 'center', gap: 12 },
  emptyText: { color: '#475569', fontSize: 15 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { backgroundColor: '#1e293b', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, borderWidth: 1, borderColor: '#334155', gap: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { color: '#f1f5f9', fontSize: 20, fontWeight: '800' },
  modalNote: { backgroundColor: 'rgba(59,130,246,0.1)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)', borderRadius: 8, padding: 12, color: '#94a3b8', fontSize: 12, lineHeight: 18 },
  modalField: { gap: 6 },
  modalLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  modalInput: { backgroundColor: '#0f172a', color: '#f1f5f9', borderWidth: 1, borderColor: '#334155', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  rolePickerRow: { flexDirection: 'row', gap: 8 },
  rolePicker: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155', backgroundColor: '#0f172a', alignItems: 'center' },
  rolePickerText: { color: '#64748b', fontSize: 12, fontWeight: '700' },
  modalSubmitBtn: { backgroundColor: '#2563eb', padding: 16, borderRadius: 10, alignItems: 'center' },
  modalSubmitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
