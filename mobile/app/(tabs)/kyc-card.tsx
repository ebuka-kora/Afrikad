import { Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { KycForCardScreen } from '../../src/screens/main/KycForCardScreen';

export default function KycCard() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <KycForCardScreen />;
}
