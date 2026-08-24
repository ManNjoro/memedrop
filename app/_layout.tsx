import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from '../components/Toast';
import { OfflineBanner } from '../components/OfflineBanner';
import { applyStoredThemePreference } from '../lib/theme';
import '../global.css'; // NativeWind entry — create this with @tailwind base/components/utilities

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file');
}

function RootLayoutNav() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Screen name="(tabs)" />

    
      <Stack.Screen name="meme/[id]" />
      <Stack.Screen name="search" />
      <Stack.Screen name="creator/[username]" />

      {/* Auth-required: filling out and submitting an upload, and settings
          (sign out, edit profile) only make sense for a signed-in user. */}
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="upload/details" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="settings/edit-profile" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    applyStoredThemePreference();
  }, []);

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <SafeAreaProvider>
        <ToastProvider>
          <OfflineBanner />
          <RootLayoutNav />
        </ToastProvider>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}