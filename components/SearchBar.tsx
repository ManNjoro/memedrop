// components/SearchBar.tsx
import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Search, X } from 'lucide-react-native';

type SearchBarProps = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  autoFocus?: boolean;
};

export function SearchBar({ value, onChangeText, placeholder = 'Search memes…', onSubmit, autoFocus }: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-surface-alt border border-border rounded-lg px-4 h-14">
      <Search size={20} color="#6B6B72" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6B6B72"
        onSubmitEditing={onSubmit}
        autoFocus={autoFocus}
        returnKeyType="search"
        accessibilityLabel="Search memes"
        className="flex-1 text-text-primary text-base ml-3"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8} accessibilityLabel="Clear search">
          <X size={18} color="#6B6B72" />
        </Pressable>
      )}
    </View>
  );
}