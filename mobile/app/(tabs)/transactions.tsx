import { Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { TransactionsScreen } from '../../src/screens/main/TransactionsScreen';

export default function Transactions() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <TransactionsScreen />;
}
