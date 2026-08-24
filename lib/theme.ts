// lib/theme.ts
import { Appearance } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const THEME_KEY = 'memedrop_theme_preference';

export type ThemePreference = 'light' | 'dark';

/**
 * NativeWind v5 (Tailwind v4 under the hood) has no custom ThemeProvider —
 * every `dark:` class in the app is driven directly by React Native's
 * Appearance API. Calling Appearance.setColorScheme() is all it takes for
 * every screen to re-render with the right variant; there's nothing else to
 * wire up. What Appearance itself doesn't do is persist the choice across
 * app restarts, so that part is handled here with SecureStore.
 */

/** Call once on app boot (see app/_layout.tsx) to re-apply the saved choice. */
export async function applyStoredThemePreference(): Promise<ThemePreference> {
  let pref: ThemePreference = 'dark'; // dark-first default per the design spec
  try {
    const saved = await SecureStore.getItemAsync(THEME_KEY);
    if (saved === 'light' || saved === 'dark') pref = saved;
  } catch {
    // fall through to the default
  }
  Appearance.setColorScheme(pref);
  return pref;
}

/** Call from the Settings toggle to switch themes and remember the choice. */
export async function setThemePreference(pref: ThemePreference): Promise<void> {
  Appearance.setColorScheme(pref);
  try {
    await SecureStore.setItemAsync(THEME_KEY, pref);
  } catch {
    // Non-fatal — worst case the choice doesn't survive an app restart.
  }
}