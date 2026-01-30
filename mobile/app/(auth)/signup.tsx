import { Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { SignupScreen } from '../../src/screens/auth/SignupScreen';

export default function Signup() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <SignupScreen />;
}
