import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../context/AuthContext';
import { logActivity } from '../../../services/activityLog';

export default function SubmitReportScreen() {
  const { user } = useAuth();
  
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [status, setStatus] = useState('COMPLIANT');
  const [riskLevel, setRiskLevel] = useState('LOW');
  const [violationsCount, setViolationsCount] = useState('0');
  const [findings, setFindings] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    if (!user) return;
    setLoading(true);
    
    // Get auditor profile
    const { data: myProfile } = await supabase.from('profiles').select('officer_id').eq('id', user.id).single();
    
    if (myProfile) {
      const { data } = await supabase
        .from('factory_assignments')
        .select('*')
        .eq('assigned_officer_id', myProfile.officer_id)
        .neq('status', 'completed');
      
      if (data) {
        setAssignments(data);
      }
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!selectedAssignmentId) {
      setError('Please select an assigned factory.');
      return;
    }
    if (!findings.trim()) {
      setError('Please provide inspection findings.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const assignment = assignments.find(a => a.id === selectedAssignmentId);
      const { data: myProfile } = await supabase.from('profiles').select('officer_id, region').eq('id', user?.id).single();

      // 1. Insert report
      const { error: reportError } = await supabase.from('reports').insert({
        factory_name: assignment.factory_name,
        factory_id: assignment.factory_id,
        region: myProfile?.region || assignment.region,
        submitted_by: user?.id,
        auditor_id: myProfile?.officer_id,
        status,
        risk_level: riskLevel,
        violations_count: parseInt(violationsCount) || 0,
        findings: findings.trim()
      });

      if (reportError) throw reportError;

      // 2. Mark assignment as completed
      const { error: updateError } = await supabase
        .from('factory_assignments')
        .update({ status: 'completed' })
        .eq('id', selectedAssignmentId);

      if (updateError) throw updateError;

      // 3. Log activity
      await logActivity('report_submitted', `Submitted report for ${assignment.factory_name}`);

      Alert.alert('Success', 'Inspection report submitted successfully!');
      router.replace('/(dashboard)/auditor');

    } catch (err: any) {
      console.error(err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={16} color="#60a5fa" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.pageTitle}>Submit Inspection Report</Text>
        <Text style={styles.pageSub}>Complete your assigned factory audits</Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
        ) : assignments.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="check-circle" size={48} color="#10b981" />
            <Text style={styles.emptyTitle}>You're all caught up!</Text>
            <Text style={styles.emptyText}>You have no pending factory inspections assigned to you.</Text>
          </View>
        ) : (
          <View style={styles.formCard}>
            
            {/* Select Assignment */}
            <View style={styles.field}>
              <Text style={styles.label}>Select Assigned Factory *</Text>
              <ScrollView style={styles.pickerBox} nestedScrollEnabled>
                {assignments.map(a => (
                  <Pressable 
                    key={a.id} 
                    style={[styles.pickerRow, selectedAssignmentId === a.id && styles.pickerRowActive]}
                    onPress={() => setSelectedAssignmentId(a.id)}
                  >
                    <View>
                      <Text style={[styles.pickerText, selectedAssignmentId === a.id && { color: '#60a5fa' }]}>
                        {a.factory_name} {a.factory_id ? `(${a.factory_id})` : ''}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        Status: {a.status.replace('_', ' ').toUpperCase()} • Due: {a.due_date || 'None'}
                      </Text>
                    </View>
                    {selectedAssignmentId === a.id && <Feather name="check" size={16} color="#60a5fa" />}
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Compliance Status */}
            <View style={styles.field}>
              <Text style={styles.label}>Compliance Status *</Text>
              <View style={styles.optionsRow}>
                {['COMPLIANT', 'UNDER REVIEW', 'NOTICE ISSUED', 'SHOW CAUSE'].map(s => (
                  <Pressable 
                    key={s} 
                    style={[styles.optionBtn, status === s && styles.optionBtnActive]}
                    onPress={() => setStatus(s)}
                  >
                    <Text style={[styles.optionText, status === s && { color: '#fff' }]}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Risk Level & Violations */}
            <View style={styles.rowGrid}>
              <View style={styles.field}>
                <Text style={styles.label}>Risk Level *</Text>
                <View style={styles.optionsRow}>
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(r => (
                    <Pressable 
                      key={r} 
                      style={[styles.optionBtn, riskLevel === r && styles.optionBtnActive]}
                      onPress={() => setRiskLevel(r)}
                    >
                      <Text style={[styles.optionText, riskLevel === r && { color: '#fff' }]}>{r}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Violations Count</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={violationsCount}
                  onChangeText={setViolationsCount}
                  placeholderTextColor="#475569"
                />
              </View>
            </View>

            {/* Findings */}
            <View style={styles.field}>
              <Text style={styles.label}>Detailed Findings & Evidence *</Text>
              <TextInput
                style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
                multiline
                numberOfLines={6}
                value={findings}
                onChangeText={setFindings}
                placeholder="Describe inspection details, any anomalies, evidence found..."
                placeholderTextColor="#475569"
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable 
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]} 
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Feather name="upload-cloud" size={18} color="#fff" />
                  <Text style={styles.submitBtnText}>Submit Inspection Report</Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { backgroundColor: '#1e293b', padding: 30, paddingBottom: 40 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  backText: { color: '#60a5fa', fontSize: 14, fontWeight: '700' },
  pageTitle: { fontSize: 28, fontWeight: '900', color: '#f1f5f9' },
  pageSub: { fontSize: 14, color: '#94a3b8', marginTop: 6 },
  content: { padding: 20, marginTop: -20, maxWidth: 800, alignSelf: 'center', width: '100%' },
  emptyState: { backgroundColor: '#1e293b', padding: 60, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#334155', gap: 16 },
  emptyTitle: { color: '#f1f5f9', fontSize: 24, fontWeight: '800' },
  emptyText: { color: '#94a3b8', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  formCard: { backgroundColor: '#1e293b', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#334155', gap: 24 },
  field: { gap: 8, flex: 1 },
  label: { color: '#cbd5e1', fontSize: 13, fontWeight: '700' },
  input: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 8, color: '#f1f5f9', padding: 14, fontSize: 15 },
  pickerBox: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 8, maxHeight: 180 },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  pickerRowActive: { backgroundColor: 'rgba(59,130,246,0.1)' },
  pickerText: { color: '#94a3b8', fontSize: 15, fontWeight: '600' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  optionBtnActive: { backgroundColor: '#3b82f6', borderColor: '#2563eb' },
  optionText: { color: '#94a3b8', fontSize: 12, fontWeight: '800' },
  rowGrid: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  errorText: { color: '#ef4444', fontSize: 14, fontWeight: '500' },
  submitBtn: { backgroundColor: '#10b981', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 18, borderRadius: 10, gap: 10, marginTop: 10 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});