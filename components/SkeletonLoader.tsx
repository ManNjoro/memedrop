// components/SkeletonLoader.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

function Pulse({ style, className }: { style?: any; className?: string }) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[{ opacity }, style]} className={`bg-surface-alt ${className ?? ''}`} />;
}

/** One skeleton card matching MediaCard's grid variant. */
export function SkeletonCard() {
  const cardWidth = (width - 16 * 2 - 12) / 2;
  return (
    <View style={{ width: cardWidth }} className="mb-4">
      <Pulse style={{ width: cardWidth, height: cardWidth * 1.15, borderRadius: 14 }} />
      <Pulse style={{ width: cardWidth * 0.7, height: 14, borderRadius: 4, marginTop: 8 }} />
      <Pulse style={{ width: cardWidth * 0.45, height: 11, borderRadius: 4, marginTop: 6 }} />
    </View>
  );
}

/** Grid of skeleton cards — drop in wherever a results grid is loading. */
export function SkeletonGrid({ count = 6 }: { count?: number }) {
  const items = Array.from({ length: count });
  const left = items.filter((_, i) => i % 2 === 0);
  const right = items.filter((_, i) => i % 2 === 1);
  return (
    <View className="flex-row" style={{ gap: 12 }}>
      <View style={{ flex: 1 }}>
        {left.map((_, i) => (
          <SkeletonCard key={`l${i}`} />
        ))}
      </View>
      <View style={{ flex: 1 }}>
        {right.map((_, i) => (
          <SkeletonCard key={`r${i}`} />
        ))}
      </View>
    </View>
  );
}