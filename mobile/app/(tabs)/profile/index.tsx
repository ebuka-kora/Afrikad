import { Redirect } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { ProfileScreen } from '../../../src/screens/main/ProfileScreen';

export default function ProfileIndex() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <ProfileScreen />;
}
