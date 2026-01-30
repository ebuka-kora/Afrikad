import { Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { OnboardingScreen } from '../../src/screens/auth/OnboardingScreen';

export default function Onboarding() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <OnboardingScreen />;
}
