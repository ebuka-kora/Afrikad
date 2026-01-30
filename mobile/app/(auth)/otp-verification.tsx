import { Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { OTPVerificationScreen } from '../../src/screens/auth/OTPVerificationScreen';

export default function OTPVerification() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <OTPVerificationScreen />;
}
