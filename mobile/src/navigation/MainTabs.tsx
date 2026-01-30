import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../constants/theme';
import { Icon } from '../components/ui/Icon';

import { HomeStack } from './HomeStack';
import { VirtualCardScreen } from '../screens/main/VirtualCardScreen';
import { TransactionsScreen } from '../screens/main/TransactionsScreen';
import { ProfileStackNavigator } from './ProfileStackNavigator';

export type MainTabsParamList = {
  Home: undefined;
  Card: undefined;
  Transactions: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.borderLight,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" library="ionicons" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Card"
        component={VirtualCardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="card" library="ionicons" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="list" library="ionicons" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" library="ionicons" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
