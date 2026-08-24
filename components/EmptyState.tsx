// components/EmptyState.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { PrimaryButton } from './Buttons';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

/**
 * Generic empty/error state used across Search, Profile uploads, offline,
 * and upload-failure moments. Keep copy short and specific per use case.
 */
export function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center justify-center px-8 py-16">
      <View className="w-20 h-20 rounded-full bg-surface-alt-light dark:bg-surface-alt items-center justify-center mb-5">
        <Icon size={32} color="#8B5CF6" strokeWidth={1.75} />
      </View>
      <Text className="text-text-primary-light dark:text-text-primary text-lg font-bold text-center mb-1.5">{title}</Text>
      {subtitle && (
        <Text className="text-text-secondary text-sm text-center leading-5 mb-6">{subtitle}</Text>
      )}
      {actionLabel && onAction && (
        <PrimaryButton label={actionLabel} onPress={onAction} className="w-full max-w-60" />
      )}
    </View>
  );
}