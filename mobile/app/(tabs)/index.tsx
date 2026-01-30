// This will redirect to the home screen component
// For now, we'll keep using the existing HomeScreen component
import { Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { HomeScreen } from '../../src/screens/main/HomeScreen';

export default function Home() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <HomeScreen />;
}
