import { Redirect } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { SettingsScreen } from '../../../src/screens/profile/SettingsScreen';

export default function Settings() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <SettingsScreen />;
}
