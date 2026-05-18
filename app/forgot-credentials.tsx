import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ForgotCredentialsScreen() {
  const [officerId, setOfficerId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </Pressable>
        </View>
        <View style={styles.content}>
          <View style={styles.iconBox}>
            <Feather name="unlock" size={32} color="#3b82f6" />
          </View>
          <Text style={styles.title}>Reset Credentials</Text>
          <Text style={styles.subtitle}>
            Enter your Officer ID to receive a secure reset link via your registered government email.
          </Text>

          {submitted ? (
            <View style={styles.successBox}>
              <Feather name="check-circle" size={20} color="#10b981" />
              <Text style={styles.successText}>Reset instructions have been sent to your registered email address.</Text>
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <Feather name="user" size={16} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Officer ID (e.g. MPCB-01)"
                  placeholderTextColor="#64748b"
                  value={officerId}
                  onChangeText={setOfficerId}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>
              <Pressable style={styles.submitBtn} onPress={() => setSubmitted(true)}>
                <Text style={styles.submitBtnText}>Request Reset Link</Text>
                <Feather name="arrow-right" size={16} color="#fff" />
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1120' },
  header: { padding: 24 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  content: { flex: 1, justifyContent: 'center', padding: 24, maxWidth: 460, width: '100%', alignSelf: 'center' },
  iconBox: {
    width: 64, height: 64, backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 24,
    borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)'
  },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#94a3b8', lineHeight: 22, marginBottom: 32 },
  form: { gap: 16 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: '#1e293b',
    borderRadius: 10, paddingHorizontal: 14, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#fff', height: '100%' },
  submitBtn: {
    backgroundColor: '#2563eb', height: 52, borderRadius: 10,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  successBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)',
    padding: 16, borderRadius: 10,
  },
  successText: { color: '#10b981', fontSize: 14, lineHeight: 20, flex: 1 },
});
