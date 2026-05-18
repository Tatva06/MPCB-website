import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const SYSTEM_ALERTS = [
  'CEMS node DF-SO2-04 flagged — zero variance 6.2h',
  'Inspection dip confirmed: Tata Power Unit 3',
  'AI model retrained — 14 new fingerprint vectors added',
  'Night data gap detected: Reliance Ind. (11PM–3AM)',
];

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { login, isLoading, error, user } = useAuth();
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  
  // If already logged in, skip login screen
  useEffect(() => {
    if (user) {
      redirectByRole(user.role);
    }
  }, [user]);

  const [idFocused, setIdFocused] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const tickerFade = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();

    // Pulse the live dot
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Ticker rotation
    const interval = setInterval(() => {
      Animated.timing(tickerFade, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setTickerIdx(i => (i + 1) % SYSTEM_ALERTS.length);
        Animated.timing(tickerFade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const validateInputs = () => {
    const cleanOfficerId = officerId.trim();
    if (!cleanOfficerId || !password) {
      return 'Both Officer ID and Authorization Key are required.';
    }
    
    // Officer ID Validation (Alphanumeric and hyphens only, min 4 chars)
    const idRegex = /^[A-Za-z0-9-]+$/;
    if (cleanOfficerId.length < 4 || !idRegex.test(cleanOfficerId)) {
      return 'Invalid Officer ID format. Only alphanumeric characters and hyphens are allowed.';
    }

    // Password Validation (Min 8 chars, 1 uppercase, 1 number, 1 special char)
    if (password.length < 8) {
      return 'Authorization Key must be at least 8 characters long.';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Authorization Key must contain at least one uppercase letter.';
    }
    if (!/[0-9]/.test(password)) {
      return 'Authorization Key must contain at least one number.';
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return 'Authorization Key must contain at least one special character.';
    }

    return null;
  };

  const redirectByRole = (role: string) => {
    if (role === 'superadmin') {
      router.replace('/(dashboard)/admin/users' as any);
    } else if (role === 'regional_manager') {
      router.replace('/(dashboard)/regional/auditors' as any);
    } else {
      router.replace('/(dashboard)');
    }
  };

  const handleLogin = async () => {
    const validationError = validateInputs();
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    
    setLocalError('');
    try {
      await login(officerId.trim(), password);
      // user state updates via AuthContext — useEffect above handles redirect
    } catch (err) {
      // Error handled by AuthContext
    }
  };

  const displayError = localError || error;

  return (
    <View style={[styles.container, { flexDirection: isMobile ? 'column' : 'row' }]}>

      {/* ── Left Panel ── */}
      <View style={[styles.brandPanel, { padding: isMobile ? 28 : 56 }]}>

        {/* Top bar */}
        <View style={styles.topBadgeRow}>
          <View style={styles.govBadge}>
            <Feather name="shield" size={10} color="#60a5fa" />
            <Text style={styles.govBadgeText}>GOVERNMENT OF MAHARASHTRA</Text>
          </View>
          <View style={styles.liveDot}>
            <Animated.View style={[styles.livePulse, { opacity: pulseAnim }]} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        <Animated.View style={[styles.brandBody, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoBox}>
            <Feather name="shield" size={isMobile ? 28 : 40} color="#fff" />
          </View>
          <Text style={[styles.brandTitle, { fontSize: isMobile ? 26 : 40 }]}>ForensiAir</Text>
          <Text style={styles.brandSubtitle}>Centralized Telemetry &{'\n'}Fraud Detection System</Text>
          <Text style={styles.versionTag}>v3.1.4 · CPCB Compliant · TLS 1.3 Encrypted</Text>

          {!isMobile && (
            <View style={styles.statsGrid}>
              {[
                { label: 'Industries Monitored', value: '1,240+' },
                { label: 'CEMS Nodes Online', value: '4,872' },
                { label: 'AI Model Accuracy', value: '97.6%' },
                { label: 'Violations Detected', value: '318' },
              ].map((s, i) => (
                <View key={i} style={styles.statBox}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          )}

          {!isMobile && (
            <View style={styles.legalBox}>
              <Feather name="alert-circle" size={14} color="#60a5fa" />
              <Text style={styles.legalText}>
                Unauthorized access is strictly prohibited under the Environment Protection Act, 1986.
                All sessions are monitored and logged.
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Ticker */}
        <View style={styles.ticker}>
          <View style={styles.tickerLabel}>
            <Feather name="radio" size={10} color="#10b981" />
            <Text style={styles.tickerLabelText}>SYSTEM</Text>
          </View>
          <Animated.Text style={[styles.tickerText, { opacity: tickerFade }]} numberOfLines={1}>
            {SYSTEM_ALERTS[tickerIdx]}
          </Animated.Text>
        </View>
      </View>

      {/* ── Right Panel (Login Form) ── */}
      <KeyboardAvoidingView 
        style={{ flex: 1, backgroundColor: '#f4f7f9' }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={[styles.formPanel, { padding: isMobile ? 24 : 48 }]}>
          <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>

          <View style={styles.formHeaderRow}>
            <View>
              <Text style={styles.formHeader}>Secure Login</Text>
              <Text style={styles.formSubHeader}>Enter your credentials to access the live monitoring grid.</Text>
            </View>
            <View style={styles.mpcbBadge}>
              <Text style={styles.mpcbBadgeText}>MPCB</Text>
            </View>
          </View>

          {displayError ? (
            <View style={styles.errorBox}>
              <Feather name="alert-triangle" size={14} color="#b91c1c" />
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          ) : null}

          {/* Officer ID */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Officer ID / Factory ID</Text>
            <View style={[styles.inputWrapper, idFocused && styles.inputWrapperFocused]}>
              <Feather name="user" size={16} color={idFocused ? '#3b82f6' : '#94a3b8'} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. MPCB-CHIEF-01"
                placeholderTextColor="#cbd5e1"
                value={officerId}
                onChangeText={setOfficerId}
                autoCapitalize="characters"
                autoCorrect={false}
                autoComplete="off"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
                onFocus={() => setIdFocused(true)}
                onBlur={() => setIdFocused(false)}
                accessibilityLabel="Officer ID Input"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Authorization Key</Text>
            <View style={[styles.inputWrapper, pwFocused && styles.inputWrapperFocused]}>
              <Feather name="lock" size={16} color={pwFocused ? '#3b82f6' : '#94a3b8'} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••••••"
                placeholderTextColor="#cbd5e1"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                ref={passwordRef}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
                accessibilityLabel="Password Input"
              />
              <Pressable 
                onPress={() => setShowPassword(v => !v)} 
                style={{ padding: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Toggle Password Visibility"
              >
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={16} color="#94a3b8" />
              </Pressable>
            </View>
          </View>



          {/* Login Button */}
          <Pressable 
            style={[styles.loginBtn, isLoading && { opacity: 0.8 }]} 
            onPress={handleLogin} 
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Login Button"
          >
            {isLoading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.loginBtnText}>Authenticating…</Text>
              </View>
            ) : (
              <>
                <Text style={styles.loginBtnText}>Access Dashboard</Text>
                <Feather name="arrow-right" size={16} color="#fff" />
              </>
            )}
          </Pressable>

          {/* Footer Links */}
          <View style={styles.footerLinks}>
            <Pressable onPress={() => router.push('/forgot-credentials')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name="lock" size={12} color="#3b82f6" />
              <Text style={styles.footerLink}>Forgot credentials?</Text>
            </Pressable>
          </View>

          <Text style={styles.footerLegal}>
            © 2025 Maharashtra Pollution Control Board · Ministry of Environment, Forest and Climate Change
          </Text>
        </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1120' },
  brandPanel: {
    flex: 1,
    backgroundColor: '#0b1120',
    justifyContent: 'space-between',
    minHeight: 360,
    borderRightWidth: 1,
    borderRightColor: '#1e293b',
  },
  topBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  govBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(59,130,246,0.1)', borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.25)', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  govBadgeText: { color: '#60a5fa', fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },
  liveDot: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  livePulse: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10b981' },
  liveText: { color: '#10b981', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  brandBody: {},
  logoBox: {
    width: 68, height: 68, backgroundColor: '#2563eb',
    borderRadius: 18, justifyContent: 'center', alignItems: 'center',
    marginBottom: 20, shadowColor: '#2563eb', shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 0 },
  },
  brandTitle: { color: '#fff', fontWeight: '900', marginBottom: 10, letterSpacing: -1 },
  brandSubtitle: { color: '#64748b', fontSize: 15, lineHeight: 24, marginBottom: 8 },
  versionTag: { color: '#334155', fontSize: 11, fontWeight: '600', marginBottom: 32 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  statBox: {
    flex: 1, minWidth: 120,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1,
    borderColor: '#1e293b', borderRadius: 10, padding: 14,
  },
  statValue: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 2 },
  statLabel: { color: '#475569', fontSize: 11, fontWeight: '600' },
  legalBox: {
    flexDirection: 'row', gap: 10,
    backgroundColor: 'rgba(59,130,246,0.07)', borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)', borderRadius: 10,
    padding: 14, alignItems: 'flex-start',
  },
  legalText: { color: '#475569', fontSize: 12, lineHeight: 20, flex: 1 },
  ticker: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(16,185,129,0.07)', borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)', borderRadius: 8, padding: 10,
  },
  tickerLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tickerLabelText: { color: '#10b981', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  tickerText: { color: '#64748b', fontSize: 11, flex: 1 },
  formPanel: { flexGrow: 1, backgroundColor: '#f4f7f9', justifyContent: 'center', alignItems: 'center' },
  formContainer: { 
    width: '100%', maxWidth: 460, 
    backgroundColor: '#fff', 
    padding: 32, 
    borderRadius: 16, 
    borderWidth: 1, borderColor: '#e2e8f0',
    borderTopWidth: 4, borderTopColor: '#1e3a8a',
    shadowColor: '#0f172a', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 4 
  },
  formHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  formHeader: { fontSize: 28, fontWeight: '900', color: '#0f172a', marginBottom: 6 },
  formSubHeader: { fontSize: 14, color: '#64748b', lineHeight: 22 },
  mpcbBadge: {
    backgroundColor: '#1e3a8a', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
  },
  mpcbBadgeText: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
    borderRadius: 8, padding: 12, marginBottom: 16,
  },
  errorText: { color: '#b91c1c', fontSize: 13, flex: 1 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#cbd5e1',
    borderRadius: 8, paddingHorizontal: 14,
    backgroundColor: '#f8fafc', minHeight: 50,
  },
  inputWrapperFocused: { borderColor: '#1e3a8a', backgroundColor: '#fff', shadowColor: '#1e3a8a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#0f172a', height: 50 },
  roleRow: { flexDirection: 'row', gap: 8 },
  roleChip: {
    flex: 1, borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 8, paddingVertical: 10, alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  roleChipActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  roleChipText: { color: '#475569', fontSize: 12, fontWeight: '600' },
  roleChipTextActive: {
    color: '#3b82f6',
  },
  loginBtn: {
    backgroundColor: '#1e3a8a', height: 52, borderRadius: 8,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 12,
    shadowColor: '#1e3a8a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  loginBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  footerLinks: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 },
  footerLink: { color: '#3b82f6', fontSize: 13 },
  footerDot: { color: '#cbd5e1', fontSize: 13 },
  footerLegal: { color: '#94a3b8', fontSize: 10, textAlign: 'center', marginTop: 24, lineHeight: 16 },
});