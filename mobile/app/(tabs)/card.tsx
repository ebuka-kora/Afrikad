import { Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { VirtualCardScreen } from '../../src/screens/main/VirtualCardScreen';

export default function Card() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <VirtualCardScreen />;
}
