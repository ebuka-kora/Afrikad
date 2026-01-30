import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../constants/theme';
import { HomeScreen } from '../screens/main/HomeScreen';
import { FundWalletScreen } from '../screens/main/FundWalletScreen';

export type HomeStackParamList = {
  HomeMain: undefined;
  FundWallet: undefined;
};

const Stack = createStackNavigator<HomeStackParamList>();

export const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen
        name="FundWallet"
        component={FundWalletScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTintColor: COLORS.accent,
          headerTitle: 'Fund Wallet',
        }}
      />
    </Stack.Navigator>
  );
};
