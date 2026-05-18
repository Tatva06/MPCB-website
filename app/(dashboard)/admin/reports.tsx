import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, useWindowDimensions, TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../context/AuthContext';
import { router } from 'expo-router';
import { logActivity } from '../../../services/activityLog';

interface Report {
  id: string;
  officer_id: string;
  officer_name: string;
  region: string | null;
  factory_name: string;
  report_type: string;
  status: 'submitted' | 'reviewed' | 'approved' | 'rejected';
  notes: string | null;
  reviewed_by: string | null;
  created_at: string;
  reviewed_at: string | null;
}

interface ActivityLog {
  id: string;
  officer_id: string;
  role: string;
  action: string;
  details: string | null;
  region: string | null;
  created_at: string;
}

const STATUS_COLORS = {
  submitted: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', text: '#60a5fa' },
  reviewed: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: '#fbbf24' },
  approved: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', text: '#34d399' },
  rejected: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#f87171' },
};

const ACTION_ICONS: Record<string, string> = {
  login: 'log-in',
  logout: 'log-out',
  report_submitted: 'file-plus',
  report_downloaded: 'download',
  report_reviewed: 'check-circle',
  factory_assigned: 'map-pin',
  user_created: 'user-plus',
  user_deleted: 'user-x',
};

const ACTION_COLORS: Record<string, string> = {
  login: '#3b82f6',
  logout: '#64748b',
  report_submitted: '#10b981',
  report_downloaded: '#8b5cf6',
  report_reviewed: '#f59e0b',
  factory_assigned: '#06b6d4',
  user_created: '#10b981',
  user_deleted: '#ef4444',
};

export default function AllReportsScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [activeTab, setActiveTab] = useState<'reports' | 'logs'>('reports');
  const [reports, setReports] = useState<Report[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (user && user.role === 'auditor') {
      router.replace('/(dashboard)');
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    if (activeTab === 'reports') {
      const { data } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setReports(data as Report[]);
    } else {
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (data) setLogs(data as ActivityLog[]);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (reportId: string, newStatus: Report['status']) => {
    await supabase.from('reports').update({
      status: newStatus,
      reviewed_by: user?.officerId,
      reviewed_at: new Date().toISOString(),
    }).eq('id', reportId);

    await logActivity('report_reviewed', `Changed report status to ${newStatus}`);
    fetchData();
  };

  const filteredReports = reports.filter((r) => {
    const matchSearch =
      r.factory_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.officer_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.officer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const filteredLogs = logs.filter((l) =>
    l.officer_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.details || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const roleColor: Record<string, string> = {
    superadmin: '#f59e0b',
    regional_manager: '#8b5cf6',
    auditor: '#3b82f6',
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.content, { padding: isMobile ? 20 : 40 }]}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              {user?.role === 'superadmin' ? 'Reports & Activity Logs' : 'Regional Reports'}
            </Text>
            <Text style={styles.subtitle}>
              {user?.role === 'superadmin'
                ? 'All submitted reports and full system activity'
                : `Reports from ${user?.officerId?.split('-')[1] || 'your'} region`}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tab, activeTab === 'reports' && styles.tabActive]}
            onPress={() => { setActiveTab('reports'); setSearchQuery(''); }}
          >
            <Feather name="file-text" size={15} color={activeTab === 'reports' ? '#60a5fa' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'reports' && styles.tabTextActive]}>
              All Reports {reports.length > 0 ? `(${reports.length})` : ''}
            </Text>
          </Pressable>

          {/* Activity Logs only visible to superadmin */}
          {user?.role === 'superadmin' && (
            <Pressable
              style={[styles.tab, activeTab === 'logs' && styles.tabActive]}
              onPress={() => { setActiveTab('logs'); setSearchQuery(''); }}
            >
              <Feather name="activity" size={15} color={activeTab === 'logs' ? '#60a5fa' : '#64748b'} />
              <Text style={[styles.tabText, activeTab === 'logs' && styles.tabTextActive]}>
                Activity Logs {logs.length > 0 ? `(${logs.length})` : ''}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Search + Filter */}
        <View style={[styles.filterRow, isMobile && { flexDirection: 'column' }]}>
          <View style={styles.searchBox}>
            <Feather name="search" size={15} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder={activeTab === 'reports' ? 'Search factory, officer...' : 'Search officer, action...'}
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {activeTab === 'reports' && (
            <View style={styles.filterPills}>
              {['all', 'submitted', 'reviewed', 'approved', 'rejected'].map((s) => (
                <Pressable
                  key={s}
                  style={[styles.pill, filterStatus === s && styles.pillActive]}
                  onPress={() => setFilterStatus(s)}
                >
                  <Text style={[styles.pillText, filterStatus === s && styles.pillTextActive]}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Content */}
        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 60 }} />
        ) : activeTab === 'reports' ? (
          // ── REPORTS LIST ──
          <View style={styles.listContainer}>
            {filteredReports.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="file-text" size={40} color="#334155" />
                <Text style={styles.emptyText}>No reports found</Text>
              </View>
            ) : (
              filteredReports.map((report) => {
                const sc = STATUS_COLORS[report.status];
                return (
                  <View key={report.id} style={styles.reportCard}>
                    <View style={styles.reportCardTop}>
                      <View style={styles.reportCardLeft}>
                        <View style={styles.reportIconBox}>
                          <Feather name="file-text" size={18} color="#3b82f6" />
                        </View>
                        <View>
                          <Text style={styles.reportFactory}>{report.factory_name}</Text>
                          <Text style={styles.reportMeta}>
                            {report.officer_name} • {report.officer_id}
                          </Text>
                          {report.region && (
                            <Text style={styles.reportRegion}>📍 {report.region}</Text>
                          )}
                        </View>
                      </View>
                      <View style={[styles.statusPill, { backgroundColor: sc.bg, borderColor: sc.border }]}>
                        <Text style={[styles.statusPillText, { color: sc.text }]}>
                          {report.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {report.notes && (
                      <Text style={styles.reportNotes}>{report.notes}</Text>
                    )}

                    <View style={styles.reportCardBottom}>
                      <Text style={styles.reportDate}>{formatDate(report.created_at)}</Text>

                      {/* Action buttons for non-auditors */}
                      {report.status === 'submitted' && (
                        <View style={styles.actionRow}>
                          <Pressable
                            style={styles.approveBtn}
                            onPress={() => handleStatusUpdate(report.id, 'approved')}
                          >
                            <Feather name="check" size={13} color="#10b981" />
                            <Text style={styles.approveBtnText}>Approve</Text>
                          </Pressable>
                          <Pressable
                            style={styles.reviewBtn}
                            onPress={() => handleStatusUpdate(report.id, 'reviewed')}
                          >
                            <Feather name="eye" size={13} color="#f59e0b" />
                            <Text style={styles.reviewBtnText}>Review</Text>
                          </Pressable>
                          <Pressable
                            style={styles.rejectBtn}
                            onPress={() => handleStatusUpdate(report.id, 'rejected')}
                          >
                            <Feather name="x" size={13} color="#ef4444" />
                            <Text style={styles.rejectBtnText}>Reject</Text>
                          </Pressable>
                        </View>
                      )}

                      {report.reviewed_by && (
                        <Text style={styles.reviewedBy}>
                          Actioned by {report.reviewed_by}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        ) : (
          // ── ACTIVITY LOGS ──
          <View style={styles.listContainer}>
            {filteredLogs.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="activity" size={40} color="#334155" />
                <Text style={styles.emptyText}>No activity logs yet</Text>
              </View>
            ) : (
              filteredLogs.map((log) => {
                const iconName = ACTION_ICONS[log.action] || 'circle';
                const color = ACTION_COLORS[log.action] || '#64748b';
                return (
                  <View key={log.id} style={styles.logRow}>
                    <View style={[styles.logIcon, { backgroundColor: `${color}20` }]}>
                      <Feather name={iconName as any} size={16} color={color} />
                    </View>
                    <View style={styles.logInfo}>
                      <View style={styles.logTopRow}>
                        <Text style={styles.logOfficer}>{log.officer_id}</Text>
                        <View style={[styles.logRolePill, { backgroundColor: `${roleColor[log.role] || '#64748b'}20` }]}>
                          <Text style={[styles.logRoleText, { color: roleColor[log.role] || '#64748b' }]}>
                            {log.role.replace('_', ' ')}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.logAction}>{log.action.replace(/_/g, ' ')}</Text>
                      {log.details && <Text style={styles.logDetails}>{log.details}</Text>}
                      {log.region && <Text style={styles.logRegion}>📍 {log.region}</Text>}
                    </View>
                    <Text style={styles.logTime}>{formatDate(log.created_at)}</Text>
                  </View>
                );
              })
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { maxWidth: 1200, alignSelf: 'center', width: '100%', gap: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 28, fontWeight: '900', color: '#f1f5f9' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 12, padding: 4, gap: 4, alignSelf: 'flex-start' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  tabActive: { backgroundColor: 'rgba(59,130,246,0.2)' },
  tabText: { color: '#64748b', fontWeight: '700', fontSize: 14 },
  tabTextActive: { color: '#60a5fa' },
  filterRow: { flexDirection: 'row', gap: 12, alignItems: 'center', flexWrap: 'wrap' },
  searchBox: { flex: 1, minWidth: 200, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1e293b', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#334155' },
  searchInput: { flex: 1, color: '#f1f5f9', fontSize: 14 },
  filterPills: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  pillActive: { backgroundColor: 'rgba(59,130,246,0.2)', borderColor: 'rgba(59,130,246,0.5)' },
  pillText: { color: '#64748b', fontSize: 12, fontWeight: '700' },
  pillTextActive: { color: '#60a5fa' },
  listContainer: { gap: 12 },
  emptyState: { padding: 60, alignItems: 'center', gap: 12, backgroundColor: '#1e293b', borderRadius: 16 },
  emptyText: { color: '#475569', fontSize: 15 },
  // Reports
  reportCard: { backgroundColor: '#1e293b', borderRadius: 14, padding: 20, borderWidth: 1, borderColor: '#334155', gap: 12 },
  reportCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  reportCardLeft: { flexDirection: 'row', gap: 14, flex: 1 },
  reportIconBox: { width: 42, height: 42, borderRadius: 10, backgroundColor: 'rgba(59,130,246,0.15)', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  reportFactory: { color: '#f1f5f9', fontSize: 16, fontWeight: '800' },
  reportMeta: { color: '#64748b', fontSize: 12, marginTop: 3 },
  reportRegion: { color: '#475569', fontSize: 11, marginTop: 2 },
  reportNotes: { color: '#94a3b8', fontSize: 13, lineHeight: 20, backgroundColor: '#0f172a', padding: 12, borderRadius: 8 },
  reportCardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  reportDate: { color: '#475569', fontSize: 12 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  statusPillText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  actionRow: { flexDirection: 'row', gap: 8 },
  approveBtn: { flexDirection: 'row', gap: 5, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  approveBtnText: { color: '#10b981', fontSize: 12, fontWeight: '700' },
  reviewBtn: { flexDirection: 'row', gap: 5, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  reviewBtnText: { color: '#f59e0b', fontSize: 12, fontWeight: '700' },
  rejectBtn: { flexDirection: 'row', gap: 5, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  rejectBtnText: { color: '#ef4444', fontSize: 12, fontWeight: '700' },
  reviewedBy: { color: '#475569', fontSize: 11, fontStyle: 'italic' },
  // Activity Logs
  logRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: '#1e293b', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#334155' },
  logIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  logInfo: { flex: 1, gap: 3 },
  logTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logOfficer: { color: '#f1f5f9', fontWeight: '800', fontSize: 14 },
  logRolePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  logRoleText: { fontSize: 11, fontWeight: '700' },
  logAction: { color: '#94a3b8', fontSize: 13, textTransform: 'capitalize' },
  logDetails: { color: '#64748b', fontSize: 12 },
  logRegion: { color: '#475569', fontSize: 11 },
  logTime: { color: '#475569', fontSize: 11, flexShrink: 0, textAlign: 'right', maxWidth: 110 },
});
