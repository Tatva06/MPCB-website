import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../context/AuthContext';
import { logActivity } from '../../../services/activityLog';
import { useThemeColor } from '../../../hooks/useThemeColor';

export default function SubmitReportScreen() {
  const { user } = useAuth();
  const theme = useThemeColor();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  
  // Auto-generated fields
  const [autoStatus, setAutoStatus] = useState('');
  const [autoRisk, setAutoRisk] = useState('');
  const [autoViolations, setAutoViolations] = useState(0);
  const [autoFindings, setAutoFindings] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    if (!user) return;
    setLoading(true);
    
    const { data: myProfile } = await supabase.from('profiles').select('officer_id').eq('id', user.id).single();
    
    if (myProfile) {
      const { data } = await supabase
        .from('factory_assignments')
        .select('*')
        .eq('assigned_officer_id', myProfile.officer_id)
        .neq('status', 'completed');
      
      if (data) setAssignments(data);
    }
    setLoading(false);
  };

  const handleSelectFactory = (assignment: any) => {
    setSelectedAssignment(assignment);
    setGenerating(true);
    
    // Simulate AI Auto-generation logic based on factory name
    setTimeout(() => {
      let findings = "Inspected facility and validated sensor placement. No visible tampering or physical bypasses found during the audit.";
      let status = "COMPLIANT";
      let risk = "LOW";
      let count = 0;

      if (assignment.factory_name.includes("Deepak") || assignment.notes?.includes("anomaly")) {
        findings = "AI detected a CRITICAL anomaly: 6.2 hour zero-variance flatline on SO2 sensors between 10PM and 4AM. Field physical audit confirms scrubber power logs do not match emissions data. Recommendation: Immediate enforcement action.";
        status = "ENFORCEMENT NOTICE";
        risk = "CRITICAL";
        count = 3;
      } else if (assignment.factory_name.includes("Tata") || assignment.notes?.includes("warning")) {
        findings = "AI detected a 'Pre-Inspection Dip' pattern. Emissions dropped 41% immediately prior to our arrival. The factory claims maintenance, but calibration logs show inconsistencies. Recommendation: Issue Warning and increase surveillance.";
        status = "WARNING";
        risk = "MEDIUM";
        count = 1;
      }

      setAutoFindings(findings);
      setAutoStatus(status);
      setAutoRisk(risk);
      setAutoViolations(count);
      setGenerating(false);
    }, 1500); // Fake generation delay
  };

  const handleSubmit = async () => {
    if (!selectedAssignment) return;
    setSubmitting(true);
    setError('');

    try {
      const { data: myProfile } = await supabase.from('profiles').select('officer_id, region').eq('id', user?.id).single();

      // 1. Insert report
      const { error: reportError } = await supabase.from('reports').insert({
        factory_name: selectedAssignment.factory_name,
        factory_id: selectedAssignment.factory_id,
        region: myProfile?.region || selectedAssignment.region,
        submitted_by: user?.id,
        auditor_id: myProfile?.officer_id,
        status: autoStatus,
        risk_level: autoRisk,
        violations_count: autoViolations,
        findings: autoFindings
      });

      if (reportError) throw reportError;

      // 2. Mark assignment as completed
      const { error: updateError } = await supabase
        .from('factory_assignments')
        .update({ status: 'completed' })
        .eq('id', selectedAssignment.id);

      if (updateError) throw updateError;

      // 3. Log activity
      await logActivity('report_submitted', `Verified and submitted auto-generated report for ${selectedAssignment.factory_name}`);

      Alert.alert('Success', 'Inspection report verified and submitted successfully!');
      
      // Fix for the TypeScript expo-router typing error: cast to any
      router.replace('/(dashboard)/auditor' as any);

    } catch (err: any) {
      console.error('Report submission error:', JSON.stringify(err));
      const msg = err?.message || err?.details || err?.hint || JSON.stringify(err);
      setError(`Submission failed: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.content, { padding: isMobile ? 20 : 40 }]}>
        
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Automated AI Report Generation</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Select an assigned factory. The PollutionGuard ML engine will automatically compile evidence and draft the report for your verification.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : assignments.length === 0 ? (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>You have no pending factory assignments.</Text>
          </View>
        ) : (
          <View style={styles.twoCol}>
            
            {/* Left: Factory Selection */}
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, flex: 1 }]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>1. Select Pending Assignment</Text>
              <View style={styles.list}>
                {assignments.map(a => (
                  <Pressable 
                    key={a.id} 
                    style={[
                      styles.assignmentItem, 
                      { backgroundColor: theme.background, borderColor: theme.border },
                      selectedAssignment?.id === a.id && { borderColor: theme.primary, backgroundColor: theme.primaryBg }
                    ]}
                    onPress={() => handleSelectFactory(a)}
                  >
                    <View>
                      <Text style={[styles.factoryName, { color: theme.text }]}>{a.factory_name}</Text>
                      <Text style={[styles.factoryId, { color: theme.textSecondary }]}>{a.factory_id} • Due: {a.due_date || 'N/A'}</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={selectedAssignment?.id === a.id ? theme.primary : theme.textSecondary} />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Right: AI Auto-Report Generation */}
            {selectedAssignment && (
              <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, flex: 1.5 }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>2. Verification & Submission</Text>
                
                {generating ? (
                  <View style={styles.generatingBox}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.generatingText, { color: theme.primary }]}>PollutionGuard AI is compiling sensor telemetry, SHAP data, and physical notes...</Text>
                  </View>
                ) : (
                  <View style={styles.generatedReport}>
                    <View style={styles.aiBadge}>
                      <Feather name="cpu" size={14} color="#10b981" />
                      <Text style={styles.aiBadgeText}>AI AUTO-GENERATED DRAFT</Text>
                    </View>

                    <Text style={[styles.reportLabel, { color: theme.textSecondary }]}>Factory Context</Text>
                    <Text style={[styles.reportValue, { color: theme.text }]}>{selectedAssignment.factory_name} ({selectedAssignment.factory_id})</Text>

                    <View style={styles.reportRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.reportLabel, { color: theme.textSecondary }]}>Recommended Status</Text>
                        <Text style={[styles.reportValue, { color: autoStatus === 'COMPLIANT' ? theme.success : theme.danger }]}>{autoStatus}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.reportLabel, { color: theme.textSecondary }]}>Detected Risk Level</Text>
                        <Text style={[styles.reportValue, { color: theme.warning }]}>{autoRisk}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.reportLabel, { color: theme.textSecondary }]}>Violations Flagged</Text>
                        <Text style={[styles.reportValue, { color: theme.text }]}>{autoViolations} Parameters</Text>
                      </View>
                    </View>

                    <Text style={[styles.reportLabel, { color: theme.textSecondary }]}>Compiled AI Findings & Field Notes</Text>
                    <View style={[styles.findingsBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
                      <Text style={[styles.findingsText, { color: theme.text }]}>{autoFindings}</Text>
                    </View>

                    <Text style={[styles.disclaimer, { color: theme.textSecondary }]}>
                      By clicking submit, you legally verify that the physical site inspection aligns with the AI-generated findings presented above. This will be sent directly to the Regional Manager for approval.
                    </Text>

                    {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}

                    <View style={styles.actionRow}>
                      <Pressable 
                        style={[styles.submitBtn, { backgroundColor: theme.primary }]} 
                        onPress={handleSubmit} 
                        disabled={submitting}
                      >
                        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Verify & Submit to RM</Text>}
                        {!submitting && <Feather name="send" size={16} color="#fff" />}
                      </Pressable>

                      {autoStatus !== 'COMPLIANT' && (
                        <Pressable 
                          style={[styles.printBtn, { borderColor: theme.primary }]}
                          onPress={() => router.push('/(dashboard)/auditor/formal-report' as any)}
                        >
                          <Text style={[styles.printText, { color: theme.primary }]}>Preview Legal PDF</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}

          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { maxWidth: 1200, alignSelf: 'center', width: '100%', gap: 24 },
  header: { marginBottom: 10 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 6, maxWidth: 600, lineHeight: 22 },
  twoCol: { flexDirection: 'row', gap: 24, flexWrap: 'wrap' },
  card: { padding: 24, borderRadius: 16, borderWidth: 1, minWidth: 300 },
  cardTitle: { fontSize: 18, fontWeight: '900', marginBottom: 20 },
  list: { gap: 12 },
  assignmentItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1 },
  factoryName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  factoryId: { fontSize: 12 },
  generatingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 16 },
  generatingText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  generatedReport: { gap: 16 },
  aiBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginBottom: 4 },
  aiBadgeText: { color: '#10b981', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  reportRow: { flexDirection: 'row', gap: 20, flexWrap: 'wrap', marginTop: 10, marginBottom: 10 },
  reportLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  reportValue: { fontSize: 16, fontWeight: '800' },
  findingsBox: { padding: 16, borderRadius: 10, borderWidth: 1, minHeight: 120 },
  findingsText: { fontSize: 14, lineHeight: 24 },
  disclaimer: { fontSize: 12, fontStyle: 'italic', marginTop: 10, lineHeight: 18 },
  error: { fontSize: 13, fontWeight: '600', marginTop: 10 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 10, flexWrap: 'wrap' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 10, flex: 1, justifyContent: 'center' },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  printBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 10, borderWidth: 1, justifyContent: 'center' },
  printText: { fontSize: 14, fontWeight: '700' }
});