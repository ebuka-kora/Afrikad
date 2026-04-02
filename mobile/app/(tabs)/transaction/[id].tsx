import { Redirect } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { TransactionDetailsScreen } from '../../../src/screens/main/TransactionDetailsScreen';

export default function TransactionDetailRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <TransactionDetailsScreen />;
}
