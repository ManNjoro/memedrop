import React, { useEffect, useRef } from 'react';
import { Stack, useSegments } from 'expo-router';
import { ClerkProvider, useAuth, useUser } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  PostHogErrorBoundary,
  PostHogProvider,
  usePostHog,
} from 'posthog-react-native';
import { ToastProvider } from '../components/Toast';
import { OfflineBanner } from '../components/OfflineBanner';
import { applyStoredThemePreference } from '../lib/theme';
import { posthog } from '../lib/posthog';
import '../global.css';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file');
}

function PostHogIdentity() {
  const posthogClient = usePostHog();
  const { isLoaded, user } = useUser();
  const identifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      identifiedUserId.current = null;
      return;
    }
    if (identifiedUserId.current === user.id) return;

    posthogClient.identify(user.id, {
      $set: {
        ...(user.primaryEmailAddress?.emailAddress
          ? { email: user.primaryEmailAddress.emailAddress }
          : {}),
        ...(user.username ? { username: user.username } : {}),
        ...(user.firstName ? { first_name: user.firstName } : {}),
        ...(user.lastName ? { last_name: user.lastName } : {}),
      },
    });
    identifiedUserId.current = user.id;
  }, [isLoaded, posthogClient, user]);

  return null;
}

function PostHogScreenTracker() {
  const posthogClient = usePostHog();
  const segments = useSegments();

  useEffect(() => {
    const screenName = segments.length > 0 ? segments.join('/') : 'index';
    posthogClient.screen(screenName);
  }, [posthogClient, segments]);

  return null;
}

function RootLayoutNav() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      
      {/* <Stack.Protected guard={!isSignedIn}>
      </Stack.Protected> */}

      <Stack.Screen name="(tabs)" />

    
      <Stack.Screen name="meme/[id]" />
      <Stack.Screen name="search" />
      <Stack.Screen name="creator/[username]" />
        <Stack.Screen name="(auth)" />

      {/* Auth-required: filling out and submitting an upload, and settings
          (sign out, edit profile) only make sense for a signed-in user. */}
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="settings/index" />
        <Stack.Screen name="upload/details" />
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
        {posthog ? (
          <PostHogProvider client={posthog}>
            <PostHogErrorBoundary>
              <PostHogIdentity />
              <PostHogScreenTracker />
              <ToastProvider>
                <OfflineBanner />
                <RootLayoutNav />
              </ToastProvider>
            </PostHogErrorBoundary>
          </PostHogProvider>
        ) : (
          <ToastProvider>
            <OfflineBanner />
            <RootLayoutNav />
          </ToastProvider>
        )}
      </SafeAreaProvider>
    </ClerkProvider>
  );
}