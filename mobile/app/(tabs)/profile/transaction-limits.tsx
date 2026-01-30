import { Redirect } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { TransactionLimitsScreen } from '../../../src/screens/profile/TransactionLimitsScreen';

export default function TransactionLimits() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <TransactionLimitsScreen />;
}
