import { Stack } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { LockProvider, useLock } from '../src/context/LockContext';
import { LockScreen } from '../src/screens/LockScreen';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { COLORS } from '../src/constants/theme';
import { StatusBar } from 'expo-status-bar';

function RootContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isLocked } = useLock();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (isAuthenticated && isLocked) {
    return <LockScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LockProvider>
          <StatusBar style="light" />
          <RootContent />
        </LockProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
