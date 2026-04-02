import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { LoginScreen } from '../src/screens/auth/LoginScreen';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading screen component
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <LoginScreen />;
}
