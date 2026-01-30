import { Redirect } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { LogoutConfirmationScreen } from '../../../src/screens/profile/LogoutConfirmationScreen';

export default function LogoutConfirmation() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <LogoutConfirmationScreen />;
}
