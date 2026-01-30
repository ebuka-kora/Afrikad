import { Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { PaymentScreen } from '../../src/screens/main/PaymentScreen';

export default function Payment() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <PaymentScreen />;
}
