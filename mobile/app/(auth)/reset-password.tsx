import { Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { ResetPasswordScreen } from '../../src/screens/auth/ResetPasswordScreen';

export default function ResetPassword() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <ResetPasswordScreen />;
}
