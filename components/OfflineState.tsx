import React from 'react';
import { WifiOff } from 'lucide-react-native';
import { EmptyState } from './EmptyState';

export function OfflineState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={WifiOff}
      title="You're offline"
      subtitle="Check your connection and try again — your feed will pick up right where it left off."
      actionLabel={onRetry ? 'Try Again' : undefined}
      onAction={onRetry}
    />
  );
}