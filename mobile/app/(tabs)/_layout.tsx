import { Tabs } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants/theme';
import { Platform } from 'react-native';

export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          borderTopWidth: 1.5,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 6,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: 0,
          paddingBottom: 0,
        },
        tabBarIconStyle: {
          marginTop: 0,
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={22} 
              color={color} 
            />
          ),
        }} 
      />
      <Tabs.Screen 
        name="card" 
        options={{ 
          title: 'Card',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'card' : 'card-outline'} 
              size={22} 
              color={color} 
            />
          ),
        }} 
      />
      <Tabs.Screen 
        name="transactions" 
        options={{ 
          title: 'Transactions',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'list' : 'list-outline'} 
              size={22} 
              color={color} 
            />
          ),
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          href: '/(tabs)/profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={22} 
              color={color} 
            />
          ),
        }} 
      />
      <Tabs.Screen name="fund-wallet" options={{ href: null }} />
      <Tabs.Screen name="withdraw" options={{ href: null }} />
      <Tabs.Screen name="payment" options={{ href: null }} />
      <Tabs.Screen name="kyc-card" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}
