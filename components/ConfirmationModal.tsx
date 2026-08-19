import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';

type ConfirmationModalProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 bg-black/60 items-center justify-center px-8">
        <View className="w-full bg-surface rounded-lg border border-border p-5">
          <Text className="text-text-primary text-lg font-bold mb-1.5">{title}</Text>
          {!!message && <Text className="text-text-secondary text-sm leading-5 mb-5">{message}</Text>}

          <View className="flex-row" style={{ gap: 10 }}>
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              className="flex-1 items-center justify-center py-3 rounded-lg bg-surface-alt border border-border"
            >
              <Text className="text-text-primary text-sm font-semibold">{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              accessibilityRole="button"
              className={`flex-1 items-center justify-center py-3 rounded-lg ${
                destructive ? 'bg-danger' : 'bg-primary'
              }`}
            >
              <Text className="text-text-primary text-sm font-bold">{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}