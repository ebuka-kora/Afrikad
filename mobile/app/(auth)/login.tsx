import { Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { LoginScreen } from '../../src/screens/auth/LoginScreen';

export default function Login() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <LoginScreen />;
}
