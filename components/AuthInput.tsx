import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, Pressable } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

type AuthInputProps = TextInputProps & {
  label: string;
  error?: string;
  isPassword?: boolean;
};

export function AuthInput({ label, error, isPassword, ...rest }: AuthInputProps) {
  const [hidden, setHidden] = useState(!!isPassword);

  return (
    <View className="mb-4">
      <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wide mb-2">{label}</Text>
      <View
        className={`flex-row items-center bg-surface-alt border rounded-lg px-4 ${
          error ? 'border-danger' : 'border-border'
        }`}
      >
        <TextInput
          placeholderTextColor="#6B6B72"
          secureTextEntry={hidden}
          autoCapitalize="none"
          className="flex-1 text-text-primary text-base py-3.5"
          {...rest}
        />
        {isPassword && (
          <Pressable onPress={() => setHidden(!hidden)} hitSlop={8} accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
            {hidden ? <Eye size={18} color="#6B6B72" /> : <EyeOff size={18} color="#6B6B72" />}
          </Pressable>
        )}
      </View>
      {!!error && <Text className="text-danger text-xs mt-1.5">{error}</Text>}
    </View>
  );
}