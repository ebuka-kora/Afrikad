# Migration to Expo Router

## What Changed

1. **Dependencies Updated:**
   - Expo SDK: 49 → 54
   - React: 18.2.0 → 19.1.0
   - React Native: 0.72.10 → 0.81.5
   - Added: expo-router ~6.0.21
   - Removed: React Navigation packages (replaced by expo-router)

2. **Entry Point:**
   - Changed from `expo/AppEntry.js` to `expo-router/entry`
   - New file-based routing structure in `app/` directory

3. **Navigation:**
   - Migrating from React Navigation to Expo Router
   - File-based routing instead of component-based

## Current Status

The app has been partially migrated to Expo Router. You have two options:

### Option 1: Complete Migration to Expo Router (Recommended)

1. Move all screens to the `app/` directory following Expo Router conventions
2. Update all navigation calls from `navigation.navigate()` to `router.push()` or `Link` components
3. Remove old React Navigation files from `src/navigation/`

### Option 2: Keep React Navigation (Temporary)

1. Re-add React Navigation packages to package.json
2. Keep using the existing navigation structure
3. Update App.tsx to work with the new Expo version

## Next Steps

1. **Install dependencies:**
   ```bash
   cd mobile
   npm install
   ```

2. **Update imports:**
   - Replace `@react-navigation/native` imports with `expo-router`
   - Use `useRouter()` and `useSegments()` from expo-router
   - Replace `navigation.navigate()` with `router.push()`

3. **File Structure:**
   ```
   app/
   ├── _layout.tsx          # Root layout
   ├── (auth)/               # Auth group
   │   ├── _layout.tsx
   │   ├── login.tsx
   │   ├── signup.tsx
   │   └── ...
   └── (tabs)/               # Main app tabs
       ├── _layout.tsx
       ├── index.tsx         # Home
       ├── card.tsx
       ├── transactions.tsx
       └── profile.tsx
   ```

4. **Update Screen Components:**
   - Remove navigation props
   - Use `useRouter()` hook instead
   - Example:
     ```typescript
     // Old
     const navigation = useNavigation();
     navigation.navigate('Home');
     
     // New
     import { useRouter } from 'expo-router';
     const router = useRouter();
     router.push('/');
     ```

## Breaking Changes

- React Navigation is no longer included
- Navigation API has changed
- File-based routing requires different structure
- Some navigation patterns need to be updated

## Testing

After migration, test:
- Authentication flow
- Tab navigation
- Stack navigation (modals, detail screens)
- Deep linking
- Back button behavior
