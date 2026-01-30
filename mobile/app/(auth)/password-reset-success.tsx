import { Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { PasswordResetSuccessScreen } from '../../src/screens/auth/PasswordResetSuccessScreen';

export default function PasswordResetSuccess() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <PasswordResetSuccessScreen />;
}
