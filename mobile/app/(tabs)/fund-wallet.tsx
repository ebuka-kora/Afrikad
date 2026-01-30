import { Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { FundWalletScreen } from '../../src/screens/main/FundWalletScreen';

export default function FundWallet() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <FundWalletScreen />;
}
