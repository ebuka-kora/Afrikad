# AfriKAD Mobile App (Expo)

React Native mobile application for AfriKAD fintech platform, built with Expo.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npm start
# or
expo start
```

3. Run on your device:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your physical device

## Project Structure

```
mobile/
├── App.tsx                    # Main app entry point
├── app.json                   # Expo configuration
├── babel.config.js            # Babel config
├── package.json              # Dependencies
├── src/
│   ├── navigation/           # Navigation setup
│   │   ├── AppNavigator.tsx
│   │   ├── AuthStack.tsx
│   │   ├── MainTabs.tsx
│   │   ├── HomeStack.tsx
│   │   └── ProfileStackNavigator.tsx
│   ├── screens/              # All screen components
│   │   ├── auth/            # Authentication screens
│   │   ├── main/            # Main app screens
│   │   └── profile/          # Profile sub-screens
│   ├── components/
│   │   ├── ui/              # Base UI components
│   │   └── afrikad/         # App-specific components
│   ├── context/
│   │   └── AuthContext.tsx  # Authentication context
│   ├── services/
│   │   └── api.ts          # API service (mock data)
│   ├── utils/               # Utility functions
│   ├── constants/
│   │   └── theme.ts         # Theme constants
│   └── data/
│       └── mockData.ts      # Mock data
```

## Features

- **Authentication**: Onboarding, Login, Signup, OTP verification, Password reset
- **Wallet Management**: View balances, fund wallet
- **Virtual Card**: View USD virtual card details
- **Transactions**: View transaction history with filters
- **Profile**: Account info, settings, notifications, support, transaction limits

## Navigation

- **Auth Stack**: Onboarding → Login/Signup → OTP → Main App
- **Main Tabs**: Home, Card, Transactions, Profile
- **Home Stack**: Home → Fund Wallet (modal)
- **Profile Stack**: Profile → Settings/Account Info/etc.

## Styling

All styling uses React Native StyleSheet with theme constants:
- Colors: Red (#DC143C), Black (#000000), Neon Green (#39FF14)
- Consistent spacing, typography, and border radius

## Mock Data

Currently uses mock data for development. Backend integration can be added by updating `src/services/api.ts`.

## Development

- Uses Expo SDK ~49.0.0
- React Navigation for navigation
- AsyncStorage for token storage
- TypeScript for type safety
