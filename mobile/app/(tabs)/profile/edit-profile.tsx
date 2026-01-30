import { Redirect } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { ProfileSettingsScreen } from '../../../src/screens/profile/ProfileSettingsScreen';

export default function EditProfile() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <ProfileSettingsScreen />;
}
