
import React from 'react';
import { Modal, View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

/**
 * Simple, dependency-free bottom sheet. Good enough for filters, sort,
 * and short action lists. Swap for @gorhom/bottom-sheet later if you need
 * gesture-driven drag/snap points.
 */
export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60" onPress={onClose} accessibilityLabel="Close sheet" />
      <View
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
        className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-xl border-t border-border px-5 pt-3"
      >
        <View className="w-10 h-1.5 rounded-full bg-border self-center mb-4" />
        {title && <Text className="text-text-primary text-lg font-bold mb-3">{title}</Text>}
        {children}
      </View>
    </Modal>
  );
}

type SheetOptionProps = {
  label: string;
  selected?: boolean;
  destructive?: boolean;
  icon?: React.ReactNode;
  onPress: () => void;
};

export function SheetOption({ label, selected, destructive, icon, onPress }: SheetOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      className="flex-row items-center justify-between py-4 px-1 border-b border-border"
    >
      <View className="flex-row items-center">
        {icon}
        <Text
          className={`text-base ${icon ? 'ml-2.5' : ''} ${
            destructive ? 'text-danger font-semibold' : selected ? 'text-primary font-bold' : 'text-text-primary font-medium'
          }`}
        >
          {label}
        </Text>
      </View>
      {selected && <View className="w-2.5 h-2.5 rounded-full bg-primary" />}
    </Pressable>
  );
}