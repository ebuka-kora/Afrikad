import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="account-info" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="transaction-limits" />
      <Stack.Screen name="support" />
      <Stack.Screen name="faq" />
      <Stack.Screen name="live-chat" />
      <Stack.Screen name="pin-code" />
      <Stack.Screen name="auto-lock" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="logout-confirmation" />
    </Stack>
  );
}
