import React from 'react';
import { View, Text } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useNetworkStatus } from '../lib/useNetworkStatus';

export function OfflineBanner() {
  const { isConnected } = useNetworkStatus();
  if (isConnected) return null;

  return (
    <View className="flex-row items-center justify-center bg-danger/15 border-b border-danger px-4 py-2.5">
      <WifiOff size={14} color="#F5484B" />
      <Text className="text-danger text-xs font-semibold ml-2">You&apos;re offline. Some content may be stale.</Text>
    </View>
  );
}