// components/Avatar.tsx
import React from 'react';
import { Image, View, Text } from 'react-native';

type AvatarProps = {
  uri?: string | null;
  name: string; // used for fallback initial
  size?: 'xs' | 'sm' | 'md' | 'lg';
};

const SIZE_MAP = { xs: 24, sm: 32, md: 44, lg: 72 };

export function Avatar({ uri, name, size = 'sm' }: AvatarProps) {
  const px = SIZE_MAP[size];
  const style = { width: px, height: px, borderRadius: px / 2 };

  if (uri) {
    return <Image source={{ uri }} style={style} accessibilityLabel={`${name} avatar`} />;
  }

  return (
    <View
      style={style}
      className="bg-primary items-center justify-center"
      accessibilityLabel={`${name} avatar`}
    >
      <Text
        className="text-text-primary font-bold"
        style={{ fontSize: px * 0.4 }}
      >
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}