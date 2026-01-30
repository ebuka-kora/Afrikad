import { Redirect } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { LiveChatScreen } from '../../../src/screens/profile/LiveChatScreen';

export default function LiveChat() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <LiveChatScreen />;
}
