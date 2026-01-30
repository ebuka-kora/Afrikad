import { Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { ForgotPasswordScreen } from '../../src/screens/auth/ForgotPasswordScreen';

export default function ForgotPassword() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <ForgotPasswordScreen />;
}
