import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../constants/theme';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { AccountInfoScreen } from '../screens/profile/AccountInfoScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { NotificationsScreen } from '../screens/profile/NotificationsScreen';
import { SupportScreen } from '../screens/profile/SupportScreen';
import { TransactionLimitsScreen } from '../screens/profile/TransactionLimitsScreen';
import { ProfileSettingsScreen } from '../screens/profile/ProfileSettingsScreen';
import { LogoutConfirmationScreen } from '../screens/profile/LogoutConfirmationScreen';

export type ProfileStackNavigatorParamList = {
  ProfileMain: undefined;
  AccountInfo: undefined;
  Settings: undefined;
  Notifications: undefined;
  Support: undefined;
  TransactionLimits: undefined;
  ProfileSettings: undefined;
  LogoutConfirmation: undefined;
};

const Stack = createStackNavigator<ProfileStackNavigatorParamList>();

export const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerTintColor: COLORS.accent,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="AccountInfo" component={AccountInfoScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="TransactionLimits" component={TransactionLimitsScreen} />
      <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
      <Stack.Screen name="LogoutConfirmation" component={LogoutConfirmationScreen} />
    </Stack.Navigator>
  );
};
