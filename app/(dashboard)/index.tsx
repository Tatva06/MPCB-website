import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function DashboardIndex() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      router.replace('/');
      return;
    }

    if (user.role === 'superadmin') {
      router.replace('/(dashboard)/admin');
    } else if (user.role === 'regional_manager') {
      router.replace('/(dashboard)/regional');
    } else {
      router.replace('/(dashboard)/auditor');
    }
  }, [user, isLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
