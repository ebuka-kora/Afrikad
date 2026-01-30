import { Redirect } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { ChangePasswordScreen } from '../../../src/screens/profile/ChangePasswordScreen';

export default function ChangePassword() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <ChangePasswordScreen />;
}
