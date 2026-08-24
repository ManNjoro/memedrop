// components/Buttons.tsx
import React from 'react';
import { Pressable, Text, ActivityIndicator, PressableProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type ButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
};

/** Primary CTA — gradient fill, used for "Drop It", "Sign In", "Upload" success actions. */
export function PrimaryButton({ label, loading, disabled, icon, className = '', ...rest }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      className={`overflow-hidden rounded-lg ${isDisabled ? 'opacity-40' : ''} ${className}`}
      {...rest}
    >
      <LinearGradient
        colors={['#8B5CF6', '#6D28D9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-row items-center justify-center px-6 py-4"
      >
        {loading ? (
          <ActivityIndicator color="#F5F5F0" />
        ) : (
          <>
            {icon}
            <Text className="text-text-primary-light dark:text-text-primary text-base font-bold ml-1">{label}</Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

/** Secondary button — outlined / surface fill, used for "Continue with Google", filters, etc. */
export function SecondaryButton({ label, loading, disabled, icon, className = '', ...rest }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      className={`flex-row items-center justify-center px-6 py-4 rounded-lg bg-surface-alt border border-border ${
        isDisabled ? 'opacity-40' : 'active:bg-surface'
      } ${className}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color="#F5F5F0" />
      ) : (
        <>
          {icon}
          <Text className="text-text-primary-light dark:text-text-primary text-base font-semibold ml-1">{label}</Text>
        </>
      )}
    </Pressable>
  );
}