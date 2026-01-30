import { Redirect } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { PinCodeScreen } from '../../../src/screens/profile/PinCodeScreen';

export default function PinCode() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <PinCodeScreen />;
}
