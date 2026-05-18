import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Modal, TextInput, ActivityIndicator, useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../context/AuthContext';
import { router } from 'expo-router';
import { logActivity } from '../../../services/activityLog';
import { mockLeaderboard } from '../../../services/mockData';

interface AuditorProfile {
  id: string;
  officer_id: string;
  full_name: string;
  region: string | null;
}

interface Assignment {
  id: string;
  factory_name: string;
  factory_id: string | null;
  region: string;
  assigned_officer_id: string;
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string | null;
  notes: string | null;
  created_at: string;
}

const STATUS_COLORS = {
  pending: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: '#fbbf24' },
  in_progress: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', text: '#60a5fa' },
  completed: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', text: '#34d399' },
};

const AVAILABLE_FACTORIES = mockLeaderboard;

export default function RegionalAuditorsScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [auditors, setAuditors] = useState<AuditorProfile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'auditors' | 'assignments'>('auditors');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Assignment form
  const [selectedAuditorId, setSelectedAuditorId] = useState('');
  const [selectedFactoryId, setSelectedFactoryId] = useState('');
  const [factorySearch, setFactorySearch] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Both superadmin and regional_manager can access
  useEffect(() => {
    if (user && user.role === 'auditor') {
      router.replace('/(dashboard)');
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Fetch auditors (superadmin sees all, RM sees their region)
    const auditorsQuery = supabase.from('profiles').select('id, officer_id, full_name, region').eq('role', 'auditor');
    if (user?.role === 'regional_manager') {
      // Get current user's region first
      const { data: myProfile } = await supabase.from('profiles').select('region').eq('id', user.id).single();
      if (myProfile?.region) auditorsQuery.eq('region', myProfile.region);
    }
    const { data: auditorsData } = await auditorsQuery.order('full_name');
    if (auditorsData) setAuditors(auditorsData as AuditorProfile[]);

    // Fetch assignments
    const assignQuery = supabase.from('factory_assignments').select('*').order('created_at', { ascending: false });
    const { data: assignData } = await assignQuery;
    if (assignData) setAssignments(assignData as Assignment[]);

    setLoading(false);
  };

  const handleAssign = async () => {
    if (!selectedAuditorId || !selectedFactoryId) {
      setError('Please select an auditor and a factory.');
      return;
    }

    setActionLoading(true);
    setError('');

    const auditor = auditors.find((a) => a.id === selectedAuditorId);
    const factory = AVAILABLE_FACTORIES.find((f) => f.id === selectedFactoryId);
    const { data: myProfile } = await supabase.from('profiles').select('region').eq('id', user?.id).single();

    const { error: insertError } = await supabase.from('factory_assignments').insert({
      factory_name: factory?.name || 'Unknown',
      factory_id: factory?.id || null,
      region: myProfile?.region || auditor?.region || 'Unknown',
      assigned_to: selectedAuditorId,
      assigned_by: user?.id,
      assigned_officer_id: auditor?.officer_id,
      status: 'pending',
      due_date: dueDate || null,
      notes: notes.trim() || null,
    });

    if (!insertError) {
      await logActivity('factory_assigned', `Assigned ${factory?.name} to ${auditor?.officer_id}`);
      setShowAssignModal(false);
      resetForm();
      fetchData();
    } else {
      setError('Failed to create assignment. Please try again.');
    }
    setActionLoading(false);
  };

  const handleUpdateStatus = async (assignmentId: string, newStatus: Assignment['status']) => {
    await supabase.from('factory_assignments').update({ status: newStatus }).eq('id', assignmentId);
    fetchData();
  };

  const resetForm = () => {
    setSelectedAuditorId('');
    setSelectedFactoryId('');
    setFactorySearch('');
    setDueDate('');
    setNotes('');
    setError('');
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const pendingCount = assignments.filter((a) => a.status === 'pending').length;
  const inProgressCount = assignments.filter((a) => a.status === 'in_progress').length;
  const completedCount = assignments.filter((a) => a.status === 'completed').length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.content, { padding: isMobile ? 20 : 40 }]}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              {user?.role === 'superadmin' ? 'Auditor Management' : 'My Region'}
            </Text>
            <Text style={styles.subtitle}>
              Manage auditors and assign factory inspections
            </Text>
          </View>
          <Pressable style={styles.assignBtn} onPress={() => setShowAssignModal(true)}>
            <Feather name="plus" size={16} color="#fff" />
            <Text style={styles.assignBtnText}>Assign Factory</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, isMobile && { flexWrap: 'wrap' }]}>
          {[
            { label: 'Total Auditors', value: auditors.length, color: '#3b82f6', icon: 'user' },
            { label: 'Pending', value: pendingCount, color: '#f59e0b', icon: 'clock' },
            { label: 'In Progress', value: inProgressCount, color: '#8b5cf6', icon: 'loader' },
            { label: 'Completed', value: completedCount, color: '#10b981', icon: 'check-circle' },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, isMobile && { width: '47%' }]}>
              <View style={[styles.statIcon, { backgroundColor: `${s.color}20` }]}>
                <Feather name={s.icon as any} size={18} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {(['auditors', 'assignments'] as const).map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Feather
                name={tab === 'auditors' ? 'users' : 'map-pin'}
                size={14}
                color={activeTab === tab ? '#60a5fa' : '#64748b'}
              />
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'auditors' ? `Auditors (${auditors.length})` : `Assignments (${assignments.length})`}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
        ) : activeTab === 'auditors' ? (
          // ── AUDITORS LIST ──
          <View style={styles.listContainer}>
            {auditors.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="users" size={40} color="#334155" />
                <Text style={styles.emptyText}>No auditors in your region yet</Text>
              </View>
            ) : (
              auditors.map((auditor) => {
                const myAssignments = assignments.filter((a) => a.assigned_officer_id === auditor.officer_id);
                const pending = myAssignments.filter((a) => a.status === 'pending').length;
                const completed = myAssignments.filter((a) => a.status === 'completed').length;

                return (
                  <View key={auditor.id} style={styles.auditorCard}>
                    <View style={styles.auditorAvatar}>
                      <Text style={styles.auditorAvatarText}>{auditor.full_name.charAt(0)}</Text>
                    </View>
                    <View style={styles.auditorInfo}>
                      <Text style={styles.auditorName}>{auditor.full_name}</Text>
                      <Text style={styles.auditorId}>{auditor.officer_id}</Text>
                      {auditor.region && <Text style={styles.auditorRegion}>📍 {auditor.region}</Text>}
                    </View>
                    <View style={styles.auditorStats}>
                      <View style={styles.miniStat}>
                        <Text style={styles.miniStatValue}>{myAssignments.length}</Text>
                        <Text style={styles.miniStatLabel}>Total</Text>
                      </View>
                      <View style={styles.miniStat}>
                        <Text style={[styles.miniStatValue, { color: '#f59e0b' }]}>{pending}</Text>
                        <Text style={styles.miniStatLabel}>Pending</Text>
                      </View>
                      <View style={styles.miniStat}>
                        <Text style={[styles.miniStatValue, { color: '#10b981' }]}>{completed}</Text>
                        <Text style={styles.miniStatLabel}>Done</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        ) : (
          // ── ASSIGNMENTS LIST ──
          <View style={styles.listContainer}>
            {assignments.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="map-pin" size={40} color="#334155" />
                <Text style={styles.emptyText}>No assignments yet</Text>
              </View>
            ) : (
              assignments.map((a) => {
                const sc = STATUS_COLORS[a.status];
                return (
                  <View key={a.id} style={styles.assignmentCard}>
                    <View style={styles.assignmentTop}>
                      <View style={styles.assignmentLeft}>
                        <View style={styles.assignmentIcon}>
                          <Feather name="map-pin" size={16} color="#8b5cf6" />
                        </View>
                        <View>
                          <Text style={styles.assignmentFactory}>{a.factory_name}</Text>
                          <Text style={styles.assignmentOfficer}>👤 {a.assigned_officer_id}</Text>
                          {a.due_date && (
                            <Text style={styles.assignmentDue}>📅 Due: {formatDate(a.due_date)}</Text>
                          )}
                        </View>
                      </View>
                      <View style={[styles.statusPill, { backgroundColor: sc.bg, borderColor: sc.border }]}>
                        <Text style={[styles.statusText, { color: sc.text }]}>
                          {a.status.replace('_', ' ').toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {a.notes && <Text style={styles.assignmentNotes}>{a.notes}</Text>}

                    <View style={styles.assignmentActions}>
                      <Text style={styles.assignmentDate}>{formatDate(a.created_at)}</Text>
                      <View style={styles.statusBtns}>
                        {a.status !== 'in_progress' && (
                          <Pressable style={styles.statusBtn} onPress={() => handleUpdateStatus(a.id, 'in_progress')}>
                            <Text style={[styles.statusBtnText, { color: '#60a5fa' }]}>Mark In Progress</Text>
                          </Pressable>
                        )}
                        {a.status !== 'completed' && (
                          <Pressable style={styles.statusBtn} onPress={() => handleUpdateStatus(a.id, 'completed')}>
                            <Text style={[styles.statusBtnText, { color: '#10b981' }]}>Mark Complete</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </View>

      {/* Assign Modal */}
      <Modal visible={showAssignModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Factory Inspection</Text>
              <Pressable onPress={() => { setShowAssignModal(false); resetForm(); }}>
                <Feather name="x" size={20} color="#94a3b8" />
              </Pressable>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Select Auditor *</Text>
              <ScrollView style={styles.auditorPicker} nestedScrollEnabled>
                {auditors.map((a) => (
                  <Pressable
                    key={a.id}
                    style={[styles.auditorPickerRow, selectedAuditorId === a.id && styles.auditorPickerRowActive]}
                    onPress={() => setSelectedAuditorId(a.id)}
                  >
                    <Text style={[styles.auditorPickerText, selectedAuditorId === a.id && { color: '#60a5fa' }]}>
                      {a.full_name} ({a.officer_id})
                    </Text>
                    {selectedAuditorId === a.id && <Feather name="check" size={14} color="#60a5fa" />}
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Select Factory *</Text>
              <TextInput
                style={[styles.modalInput, { marginBottom: 6 }]}
                value={factorySearch}
                onChangeText={setFactorySearch}
                placeholderTextColor="#475569"
                placeholder="Search factory name or ID..."
              />
              <ScrollView style={styles.auditorPicker} nestedScrollEnabled>
                {AVAILABLE_FACTORIES
                  .filter((f) => 
                    f.name.toLowerCase().includes(factorySearch.toLowerCase()) || 
                    f.id.toLowerCase().includes(factorySearch.toLowerCase())
                  )
                  .map((f) => {
                  const existing = assignments.find(a => a.factory_id === f.id && a.status !== 'completed');
                  const isAssigned = !!existing;

                  return (
                    <Pressable
                      key={f.id}
                      style={[styles.auditorPickerRow, selectedFactoryId === f.id && styles.auditorPickerRowActive, isAssigned && { opacity: 0.5 }]}
                      onPress={() => !isAssigned && setSelectedFactoryId(f.id)}
                      disabled={isAssigned}
                    >
                      <View>
                        <Text style={[styles.auditorPickerText, selectedFactoryId === f.id && { color: '#60a5fa' }]}>
                          {f.name} ({f.id})
                        </Text>
                        {isAssigned && (
                          <Text style={{ fontSize: 10, color: '#f59e0b', marginTop: 2 }}>
                            Currently assigned to {existing.assigned_officer_id}
                          </Text>
                        )}
                      </View>
                      {selectedFactoryId === f.id && <Feather name="check" size={14} color="#60a5fa" />}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {[
              { label: 'Due Date (YYYY-MM-DD)', value: dueDate, set: setDueDate },
              { label: 'Notes (optional)', value: notes, set: setNotes },
            ].map((f) => (
              <View key={f.label} style={styles.modalField}>
                <Text style={styles.modalLabel}>{f.label}</Text>
                <TextInput
                  style={styles.modalInput}
                  value={f.value}
                  onChangeText={f.set}
                  placeholderTextColor="#475569"
                  placeholder={f.label}
                />
              </View>
            ))}

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <Pressable
              style={[styles.submitBtn, actionLoading && { opacity: 0.6 }]}
              onPress={handleAssign}
              disabled={actionLoading}
            >
              {actionLoading ? <ActivityIndicator color="#fff" size="small" /> : (
                <Text style={styles.submitBtnText}>Assign Inspection</Text>
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
  assignBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#7c3aed', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  assignBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 16 },
  statCard: { flex: 1, backgroundColor: '#1e293b', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#334155', gap: 8 },
  statIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '900', color: '#f1f5f9' },
  statLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 12, padding: 4, gap: 4, alignSelf: 'flex-start' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  tabActive: { backgroundColor: 'rgba(59,130,246,0.2)' },
  tabText: { color: '#64748b', fontWeight: '700', fontSize: 14 },
  tabTextActive: { color: '#60a5fa' },
  listContainer: { gap: 12 },
  emptyState: { padding: 60, alignItems: 'center', gap: 12, backgroundColor: '#1e293b', borderRadius: 16 },
  emptyText: { color: '#475569', fontSize: 15 },
  // Auditor cards
  auditorCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#1e293b', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: '#334155' },
  auditorAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(59,130,246,0.2)', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  auditorAvatarText: { color: '#60a5fa', fontSize: 18, fontWeight: '800' },
  auditorInfo: { flex: 1 },
  auditorName: { color: '#f1f5f9', fontSize: 15, fontWeight: '700' },
  auditorId: { color: '#64748b', fontSize: 12, marginTop: 2, fontFamily: 'monospace' },
  auditorRegion: { color: '#475569', fontSize: 11, marginTop: 2 },
  auditorStats: { flexDirection: 'row', gap: 16 },
  miniStat: { alignItems: 'center' },
  miniStatValue: { color: '#f1f5f9', fontSize: 18, fontWeight: '800' },
  miniStatLabel: { color: '#475569', fontSize: 10, fontWeight: '600' },
  // Assignment cards
  assignmentCard: { backgroundColor: '#1e293b', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: '#334155', gap: 12 },
  assignmentTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  assignmentLeft: { flexDirection: 'row', gap: 12, flex: 1 },
  assignmentIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(139,92,246,0.15)', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  assignmentFactory: { color: '#f1f5f9', fontSize: 15, fontWeight: '800' },
  assignmentOfficer: { color: '#64748b', fontSize: 12, marginTop: 3 },
  assignmentDue: { color: '#475569', fontSize: 11, marginTop: 2 },
  assignmentNotes: { color: '#94a3b8', fontSize: 13, backgroundColor: '#0f172a', padding: 10, borderRadius: 8 },
  assignmentActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  assignmentDate: { color: '#475569', fontSize: 11 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  statusBtns: { flexDirection: 'row', gap: 8 },
  statusBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  statusBtnText: { fontSize: 12, fontWeight: '700' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { backgroundColor: '#1e293b', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, borderWidth: 1, borderColor: '#334155', gap: 14, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { color: '#f1f5f9', fontSize: 18, fontWeight: '800' },
  modalField: { gap: 6 },
  modalLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  modalInput: { backgroundColor: '#0f172a', color: '#f1f5f9', borderWidth: 1, borderColor: '#334155', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  auditorPicker: { backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', maxHeight: 140 },
  auditorPickerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  auditorPickerRowActive: { backgroundColor: 'rgba(59,130,246,0.1)' },
  auditorPickerText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  errorText: { color: '#ef4444', fontSize: 13 },
  submitBtn: { backgroundColor: '#7c3aed', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
