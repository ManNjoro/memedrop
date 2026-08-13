// constants/theme.ts
// Central design tokens for MemeDrop. Keep this in sync with tailwind.config.js.
// Dark-first. Light values included for the optional light appearance.

export const colors = {
  dark: {
    bg: '#0B0B0D',          // near-black background
    surface: '#161618',      // cards / raised surfaces
    surfaceAlt: '#1E1E21',   // chips, inputs, secondary surfaces
    border: '#2A2A2E',
    textPrimary: '#F5F5F0',  // off-white
    textSecondary: '#A3A3AA',
    textMuted: '#6B6B72',
    primary: '#8B5CF6',      // electric purple
    primaryPressed: '#7C3AED',
    secondary: '#B4F42A',    // vibrant lime
    danger: '#F5484B',
    overlay: 'rgba(0,0,0,0.6)',
  },
  light: {
    bg: '#FAFAF8',
    surface: '#FFFFFF',
    surfaceAlt: '#F0F0EE',
    border: '#E4E4E2',
    textPrimary: '#121214',
    textSecondary: '#5B5B62',
    textMuted: '#8C8C92',
    primary: '#7C3AED',
    primaryPressed: '#6D28D9',
    secondary: '#86C40F',
    danger: '#DC2626',
    overlay: 'rgba(0,0,0,0.4)',
  },
} as const;

export const gradients = {
  // Use sparingly: hero areas, primary CTA, selected states.
  brand: ['#8B5CF6', '#B4F42A'] as const,
  uploadCta: ['#8B5CF6', '#6D28D9'] as const,
};

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

export type ThemeMode = 'dark' | 'light';