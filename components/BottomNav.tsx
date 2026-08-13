// components/BottomNav.tsx
// Custom tab bar to pass as `tabBar` prop on <Tabs> from expo-router.
// Usage in app/(tabs)/_layout.tsx:
//   <Tabs tabBar={(props) => <BottomNav {...props} />}>...</Tabs>
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Compass, Plus, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ICONS: Record<string, any> = {
  index: Home,
  explore: Compass,
  upload: Plus,
  profile: User,
};

const LABELS: Record<string, string> = {
  index: 'Home',
  explore: 'Explore',
  upload: 'Upload',
  profile: 'Profile',
};

export function BottomNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      className="flex-row bg-surface border-t border-border pt-2.5 px-4"
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const Icon = ICONS[route.name] ?? Home;
        const label = LABELS[route.name] ?? route.name;
        const isUpload = route.name === 'upload';

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        if (isUpload) {
          // Upload gets the standout treatment: elevated gradient circle.
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityLabel="Upload a meme"
              className="flex-1 items-center -mt-6"
            >
              <LinearGradient
                colors={['#8B5CF6', '#B4F42A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 52, height: 52, borderRadius: 26 }}
                className="items-center justify-center shadow-lg"
              >
                <Icon size={24} color="#0B0B0D" strokeWidth={2.5} />
              </LinearGradient>
              <Text className="text-text-muted text-[11px] font-medium mt-1">{label}</Text>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            className="flex-1 items-center justify-center py-1"
          >
            <Icon size={24} color={focused ? '#8B5CF6' : '#6B6B72'} strokeWidth={focused ? 2.5 : 2} />
            <Text className={`text-[11px] font-medium mt-1 ${focused ? 'text-primary' : 'text-text-muted'}`}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}