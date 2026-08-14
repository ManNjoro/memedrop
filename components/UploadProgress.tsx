import React from 'react';
import { View, Text } from 'react-native';

type UploadProgressProps = {
  progress: number; // 0 to 1
  label?: string;
};

/** Determinate progress bar shown while a meme uploads. Reused for any long-running upload/sync action. */
export function UploadProgress({ progress, label = 'Uploading…' }: UploadProgressProps) {
  const pct = Math.round(Math.min(Math.max(progress, 0), 1) * 100);
  return (
    <View className="w-full">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-text-primary text-sm font-semibold">{label}</Text>
        <Text className="text-text-secondary text-sm font-medium">{pct}%</Text>
      </View>
      <View className="h-2.5 rounded-full bg-surface-alt overflow-hidden">
        <View style={{ width: `${pct}%` }} className="h-2.5 rounded-full bg-primary" />
      </View>
    </View>
  );
}