import { Redirect } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { AccountInfoScreen } from '../../../src/screens/profile/AccountInfoScreen';

export default function AccountInfo() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <AccountInfoScreen />;
}
