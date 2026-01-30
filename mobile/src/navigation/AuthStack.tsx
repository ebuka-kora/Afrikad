import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../constants/theme';

import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { OTPVerificationScreen } from '../screens/auth/OTPVerificationScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { PasswordResetSuccessScreen } from '../screens/auth/PasswordResetSuccessScreen';

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  OTP: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  PasswordResetSuccess: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
      initialRouteName="Onboarding"
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="OTP" component={OTPVerificationScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="PasswordResetSuccess" component={PasswordResetSuccessScreen} />
    </Stack.Navigator>
  );
};
