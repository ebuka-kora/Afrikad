import { Redirect } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { SupportScreen } from '../../../src/screens/profile/SupportScreen';

export default function Support() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <SupportScreen />;
}
