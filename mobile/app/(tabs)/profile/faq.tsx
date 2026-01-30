import { Redirect } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { FAQScreen } from '../../../src/screens/profile/FAQScreen';

export default function FAQ() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <FAQScreen />;
}
