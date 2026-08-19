import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react-native';

type ToastVariant = 'success' | 'error' | 'info';

type ToastConfig = {
  message: string;
  variant?: ToastVariant;
  duration?: number; // ms
};

type ToastContextValue = {
  showToast: (config: ToastConfig) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastVariant, any> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const ACCENTS: Record<ToastVariant, string> = {
  success: '#B4F42A',
  error: '#F5484B',
  info: '#8B5CF6',
};

/**
 * Wrap the app root (inside SafeAreaProvider) with <ToastProvider> once, then
 * call `const { showToast } = useToast()` anywhere to fire a toast — e.g.
 * after a download completes, a share fails, or a save succeeds.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [config, setConfig] = useState<ToastConfig | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -12, duration: 180, useNativeDriver: true }),
    ]).start(() => setConfig(null));
  }, [opacity, translateY]);

  const showToast = useCallback(
    ({ message, variant = 'info', duration = 2600 }: ToastConfig) => {
      if (timer.current) clearTimeout(timer.current);
      setConfig({ message, variant, duration });
      opacity.setValue(0);
      translateY.setValue(-12);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
      timer.current = setTimeout(hide, duration);
    },
    [opacity, translateY, hide]
  );

  const Icon = config ? ICONS[config.variant ?? 'info'] : Info;
  const accent = config ? ACCENTS[config.variant ?? 'info'] : ACCENTS.info;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {config && (
        <Animated.View
          style={{
            position: 'absolute',
            top: insets.top + 8,
            left: 16,
            right: 16,
            opacity,
            transform: [{ translateY }],
          }}
        >
          <View className="flex-row items-center bg-surface border border-border rounded-lg px-4 py-3.5 shadow-lg">
            <Icon size={18} color={accent} />
            <Text className="text-text-primary text-sm font-medium ml-2.5 flex-1" numberOfLines={2}>
              {config.message}
            </Text>
            <Pressable onPress={hide} hitSlop={8} accessibilityLabel="Dismiss notification">
              <X size={16} color="#6B6B72" />
            </Pressable>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>');
  return ctx;
}