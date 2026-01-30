# Guide: Converting a Web/React App to Expo (React Native)

Use this document as a brief for an AI (or yourself) when converting an existing web or React app into an **Expo app** with **Expo Router**. It captures the structure, config, dependency choices, and critical fixes from a production conversion.

---

## 1. What You're Converting

- **From:** A React web app (e.g. Vite + React DOM) or a React Native app using React Navigation
- **To:** An Expo (React Native) app with **file-based routing** via **Expo Router**

**Target stack (keep these versions if the user specifies, e.g. Expo 54):**

- `expo`: `~54.0.31`
- `react`: `19.1.0`
- `react-native`: `0.81.5`
- `expo-router`: `~6.0.22`
- `react-native-reanimated`: `~4.1.1`
- `react-native-worklets`: `~0.7.0` (required by Reanimated 4.x)
- `whatwg-fetch`: `^3.6.20` (required by `@expo/metro-runtime`)

---

## 2. Project Structure After Conversion

```
mobile/
├── app/                    # Expo Router: file-based routes (REPLACES src/app or React Router)
│   ├── _layout.tsx         # Root layout: Stack, AuthProvider, StatusBar
│   ├── index.tsx           # Entry: redirect to (auth) or (tabs) based on auth
│   ├── (auth)/             # Route group: auth flows
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── onboarding.tsx
│   │   ├── forgot-password.tsx
│   │   ├── reset-password.tsx
│   │   ├── otp-verification.tsx
│   │   ├── password-reset-success.tsx
│   │   └── ...
│   └── (tabs)/             # Route group: main app tabs
│       ├── _layout.tsx     # Tabs layout, auth check, Redirect if not logged in
│       ├── index.tsx       # Home tab
│       ├── card.tsx
│       ├── transactions.tsx
│       ├── profile.tsx
│       ├── fund-wallet.tsx
│       └── profile/        # Nested stack under profile tab
│           ├── _layout.tsx
│           ├── index.tsx
│           ├── settings.tsx
│           ├── account-info.tsx
│           └── ...
├── assets/                 # REQUIRED: app icons and splash
│   ├── icon.png
│   ├── splash.png
│   ├── adaptive-icon.png
│   └── favicon.png
├── src/
│   ├── components/         # Reusable UI (keep; adapt View/Text, no div/span)
│   ├── context/           # Auth, etc. (keep)
│   ├── screens/           # Actual screen UIs – app/*.tsx import and render these
│   ├── services/          # API, storage (keep; use fetch/axios, AsyncStorage)
│   ├── constants/
│   └── utils/
├── app.json               # Expo config: name, icon, splash, plugins, scheme
├── babel.config.js
├── metro.config.js
├── tsconfig.json
└── package.json
```

**Principles:**

- **`app/`** = Routes only. Each route file imports and renders a **screen** from `src/screens/`.
- **`src/screens/`** = Presentational logic. No routing config here; they use `useRouter()` for navigation.
- **`src/`** stays mostly as-is; replace HTML/CSS with React Native (`View`, `Text`, `StyleSheet`, `TouchableOpacity`, etc.).

---

## 3. package.json (Critical Fields)

```json
{
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~54.0.31",
    "expo-router": "~6.0.22",
    "expo-constants": "~18.0.13",
    "expo-status-bar": "~3.0.9",
    "expo-linear-gradient": "~15.0.8",
    "expo-linking": "~8.0.11",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "react-native-reanimated": "~4.1.1",
    "react-native-worklets": "~0.7.0",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "whatwg-fetch": "^3.6.20",
    "@react-native-async-storage/async-storage": "^2.1.0"
  },
  "overrides": {
    "react": "19.1.0",
    "react-native": "0.81.5"
  }
}
```

**Must-have:**

- `"main": "expo-router/entry"`
- `expo`, `expo-router`, `react-native-reanimated`, `react-native-worklets`, `whatwg-fetch`
- `overrides` for `react` and `react-native` if you pin them.

---

## 4. app.json (Expo Config)

```json
{
  "expo": {
    "name": "YourApp",
    "slug": "yourapp",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": { "supportsTablet": true, "bundleIdentifier": "com.yourapp" },
    "android": {
      "adaptiveIcon": { "foregroundImage": "./assets/adaptive-icon.png", "backgroundColor": "#000000" },
      "package": "com.yourapp"
    },
    "web": { "favicon": "./assets/favicon.png" },
    "plugins": ["expo-router"],
    "scheme": "yourapp"
  }
}
```

**Assets:** Create `assets/` with at least `icon.png`, `splash.png`, `adaptive-icon.png`, `favicon.png`. Use placeholders (e.g. 1×1 PNG) if needed; replace before release.

---

## 5. babel.config.js

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'babel-plugin-module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: { '@': './src' },
        },
      ],
      'react-native-reanimated/plugin',  // MUST be last
    ],
  };
};
```

**Do NOT include `expo-router/babel`** in SDK 50+; `babel-preset-expo` covers it. Including it causes deprecation warnings.

**`react-native-reanimated/plugin` must be last.** It depends on `react-native-worklets`; ensure `react-native-worklets` is installed.

---

## 6. metro.config.js – CRITICAL (Avoid Blocking node_modules)

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = [__dirname];

config.resolver = {
  ...config.resolver,
  blockList: [
    /.*\/node_modules\/.*\/node_modules\/.*/,
    /.*\/\.expo\/.*/,
    /.*\/\.git\/.*/,
    /.*\/\.DS_Store/,
    /.*\/__tests__\/.*/,
    /.*\/\.test\./,
    /.*\/\.spec\./,
  ],
};
```

**Do NOT add these to `blockList`:**

- `/.*\/build\/.*/` → Breaks `expo-router/build/qualified-entry` and `expo-router/build/renderRootComponent`.
- `/.*\/dist\/.*/` → Breaks `whatwg-fetch` (main: `dist/fetch.umd.js`) and other packages that ship a `dist/` entry.

Blocking `build/` or `dist/` causes:

- `Unable to resolve "expo-router/build/qualified-entry"`
- `Unable to resolve "whatwg-fetch"`

---

## 7. tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["**/*.ts", "**/*.tsx"]
}
```

---

## 8. Navigation: React Navigation → Expo Router

| Before (React Navigation) | After (Expo Router) |
|---------------------------|----------------------|
| `import { useNavigation } from '@react-navigation/native'` | `import { useRouter } from 'expo-router'` |
| `const navigation = useNavigation()` | `const router = useRouter()` |
| `navigation.navigate('ScreenName', { id })` | `router.push('/route-path')` or `router.push({ pathname: '/(tabs)/profile', params: { id } })` |
| `navigation.goBack()` | `router.back()` |
| `navigation.replace('ScreenName')` | `router.replace('/(auth)/login')` |
| `<Stack.Navigator>`, `<Tab.Navigator>` in a central nav file | `app/_layout.tsx`, `app/(auth)/_layout.tsx`, `app/(tabs)/_layout.tsx` with `<Stack>`, `<Tabs>` from `expo-router` |

**In `src/screens/*`:** Replace `useNavigation` with `useRouter` and `navigation.navigate` / `navigation.goBack` with `router.push` / `router.back` / `router.replace`.

**Route paths:** Use Expo Router paths, e.g. `/(auth)/login`, `/(tabs)`, `/(tabs)/profile/settings`, `/(tabs)/fund-wallet`.

---

## 9. Route Files (app/*.tsx) – Thin Wrappers

Each `app/**/*.tsx` file:

1. Imports the **screen** from `src/screens/`.
2. Optionally uses `useAuth` (or similar) and `<Redirect href="..." />` from `expo-router`.
3. Renders the screen.

**Example – `app/(auth)/login.tsx`:**

```tsx
import { Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { LoginScreen } from '../../src/screens/auth/LoginScreen';

export default function Login() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Redirect href="/(tabs)" />;
  return <LoginScreen />;
}
```

**Example – `app/(tabs)/index.tsx` (Home tab):**

```tsx
import { Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { HomeScreen } from '../../src/screens/main/HomeScreen';

export default function Home() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  return <HomeScreen />;
}
```

**Example – `app/index.tsx` (root entry):**

```tsx
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Redirect href="/(tabs)" />;
  return <Redirect href="/(auth)/login" />;
}
```

---

## 10. Layouts (app/_layout.tsx and Groups)

**Root – `app/_layout.tsx`:**

```tsx
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
```

**Tabs – `app/(tabs)/_layout.tsx`:**

```tsx
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#39FF14',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: { backgroundColor: '#000', borderTopColor: '#333' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: () => null }} />
      <Tabs.Screen name="card" options={{ title: 'Card', tabBarIcon: () => null }} />
      <Tabs.Screen name="transactions" options={{ title: 'Transactions', tabBarIcon: () => null }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', href: '/(tabs)/profile' }} />
      <Tabs.Screen name="fund-wallet" options={{ href: null }} />
    </Tabs>
  );
}
```

Use `href: null` to hide a screen from the tab bar.

---

## 11. Required Dependencies and Fixes

| Problem | Fix |
|---------|-----|
| `Unable to resolve "expo-router/build/qualified-entry"` | Do **not** add `/.*\/build\/.*/` to Metro `blockList`. |
| `Unable to resolve "whatwg-fetch"` | 1) Add `"whatwg-fetch": "^3.6.20"` to `dependencies`. 2) Do **not** add `/.*\/dist\/.*/` to Metro `blockList`. |
| `Cannot find module 'react-native-worklets/plugin'` | Add `"react-native-worklets": "~0.7.0"` (or `>=0.5.0` compatible with Reanimated). |
| `expo-router/babel is deprecated` | Remove `expo-router/babel` from `babel.config.js` (use `babel-preset-expo` only). |
| `Unable to resolve asset "./assets/icon.png"` | Create `assets/` with `icon.png`, `splash.png`, `adaptive-icon.png`, `favicon.png`. |
| `The expo package was found but we couldn't resolve the Expo SDK version` | Run `npm install` (or `npm install --legacy-peer-deps`) so `expo` is properly installed before `npx expo install` / `npx expo start`. |

---

## 12. UI and Code Adaptations (Web → React Native)

- `div` → `View`
- `span` / `p` → `Text`
- `button` / `a` → `TouchableOpacity` or `Pressable`
- `className` / CSS → `StyleSheet.create`
- `img` → `Image` from `react-native` or `expo-image`
- `input` → `TextInput` or your `Input` wrapper
- Icons: `@expo/vector-icons` (e.g. `Ionicons`, `MaterialIcons`)
- `window` / `document` → avoid or use `expo-constants`, `expo-linking`, `Dimensions`, `Platform`
- `localStorage` → `@react-native-async-storage/async-storage`

---

## 13. Post-Conversion Commands

```bash
cd mobile
npm install --legacy-peer-deps
npx expo install expo-router react-native-reanimated
npx expo start --clear
```

If the user has locked Expo (e.g. `~54.0.31`), do **not** change the `expo` version. Only fix dependencies and config as above.

---

## 14. Quick Checklist for the AI

- [ ] `package.json`: `main: "expo-router/entry"`, `expo`, `expo-router`, `react-native-reanimated`, `react-native-worklets`, `whatwg-fetch`
- [ ] `app.json`: `icon`, `splash`, `adaptive-icon`, `favicon`, `plugins: ["expo-router"]`, `scheme`
- [ ] `assets/`: `icon.png`, `splash.png`, `adaptive-icon.png`, `favicon.png`
- [ ] `babel.config.js`: `babel-preset-expo`, `babel-plugin-module-resolver` (alias `@`), `react-native-reanimated/plugin` last; **no** `expo-router/babel`
- [ ] `metro.config.js`: **no** `/.*\/build\/.*/` or `/.*\/dist\/.*/` in `blockList`
- [ ] `app/_layout.tsx`, `app/(auth)/_layout.tsx`, `app/(tabs)/_layout.tsx` with `Stack` / `Tabs` from `expo-router`
- [ ] `app/**/*.tsx` route files: thin wrappers that `Redirect` when needed and render `src/screens/*`
- [ ] `src/screens/*`: `useRouter` from `expo-router`; `router.push`, `router.back`, `router.replace` instead of `useNavigation` / `navigate` / `goBack`
- [ ] `tsconfig.json`: `extends: "expo/tsconfig.base"`, `paths` for `@/*`
