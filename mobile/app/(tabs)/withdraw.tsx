import { Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { WithdrawScreen } from '../../src/screens/main/WithdrawScreen';

export default function Withdraw() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <WithdrawScreen />;
}
