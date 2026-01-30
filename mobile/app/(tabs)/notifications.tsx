import { Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { NotificationsScreen } from '../../src/screens/profile/NotificationsScreen';

export default function Notifications() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <NotificationsScreen />;
}
