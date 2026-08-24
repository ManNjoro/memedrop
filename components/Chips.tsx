import React from 'react';
import { Pressable, Text } from 'react-native';
import { X } from 'lucide-react-native';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

/** Rounded pill used for categories in Explore ("Programming", "Gaming"...) */
export function CategoryChip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      className={`px-4 py-2.5 rounded-lg mr-2 border ${
        selected ? 'bg-primary border-primary' : 'bg-surface-alt-light dark:bg-surface-alt border-border-light dark:border-border'
      }`}
    >
      <Text className={`text-sm font-semibold ${selected ? 'text-text-primary' : 'text-text-secondary'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Compact filter chip used in Search Results ("All", "Images", "Videos") */
export function FilterChip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      className={`px-3.5 py-2 rounded-lg mr-2 ${selected ? 'bg-secondary' : 'bg-surface-alt-light dark:bg-surface-alt'}`}
    >
      <Text className={`text-sm font-semibold ${selected ? 'text-bg-light dark:text-bg' : 'text-text-secondary'}`}>{label}</Text>
    </Pressable>
  );
}

/** Removable tag chip used on Upload Details ("#programming ×") */
export function TagChip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <Pressable
      onPress={onRemove}
      className="flex-row items-center bg-surface-alt-light dark:bg-surface-alt border border-border-light dark:border-border rounded-lg pl-3 pr-2 py-1.5 mr-2 mb-2"
    >
      <Text className="text-secondary text-sm font-medium mr-1">#{label}</Text>
      {onRemove && <X size={14} color="#6B6B72" />}
    </Pressable>
  );
}