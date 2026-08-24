import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from '@/components/CustomSafeAreaView';
import { useClerk, useUser } from '@clerk/expo';
import {
  ArrowLeft,
  User,
  AtSign,
  LogOut,
  Moon,
  Bell,
  Info,
  Shield,
  FileText,
  Flag,
  ChevronRight,
} from 'lucide-react-native';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { useToast } from '../../components/Toast';
import { applyStoredThemePreference, setThemePreference } from '../../lib/theme';

type RowProps = {
  icon: React.ElementType;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  right?: React.ReactNode;
};

function SettingsRow({ icon: Icon, label, value, onPress, destructive, disabled, right }: RowProps) {
  const isInteractive = !!onPress && !disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={!isInteractive}
      accessibilityRole={isInteractive ? 'button' : undefined}
      className={`flex-row items-center px-4 py-3.5 ${isInteractive ? 'active:bg-surface-alt' : ''} ${disabled ? 'opacity-50' : ''}`}
    >
      <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${destructive ? 'bg-danger/15' : 'bg-surface-alt'}`}>
        <Icon size={16} color={destructive ? '#F5484B' : '#A3A3AA'} />
      </View>
      <Text className={`flex-1 text-sm font-medium ${destructive ? 'text-danger' : 'text-text-primary'}`}>
        {label}
      </Text>
      {right ? (
        right
      ) : isInteractive ? (
        <View className="flex-row items-center">
          {!!value && <Text className="text-text-muted text-xs mr-1.5">{value}</Text>}
          <ChevronRight size={16} color="#6B6B72" />
        </View>
      ) : (
        !!value && <Text className="text-text-muted text-xs">{value}</Text>
      )}
    </Pressable>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text className="text-text-muted text-xs font-semibold uppercase tracking-wide px-4 pt-6 pb-2">
      {children}
    </Text>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { showToast } = useToast();

  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [signOutVisible, setSignOutVisible] = useState(false);

  // Hydrate the switch from the actual saved preference rather than
  // assuming dark — someone may have already switched to light mode in a
  // previous session.
  useEffect(() => {
    applyStoredThemePreference().then((pref) => setDarkMode(pref === 'dark'));
  }, []);

  const onToggleDarkMode = async (value: boolean) => {
    setDarkMode(value); // update immediately so the switch doesn't feel laggy
    await setThemePreference(value ? 'dark' : 'light');
  };

  const onConfirmSignOut = async () => {
    setSignOutVisible(false);
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch {
      showToast({ message: 'Couldn\u2019t sign out. Try again.', variant: 'error' });
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <View className="flex-row items-center px-4 pt-2 pb-3">
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Go back" className="mr-3">
          <ArrowLeft size={22} color="#F5F5F0" />
        </Pressable>
        <Text className="text-text-primary text-xl font-extrabold">Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <SectionLabel>Account</SectionLabel>
        <View className="bg-surface mx-4 rounded-lg border border-border overflow-hidden">
          <SettingsRow
            icon={User}
            label="Edit Profile"
            value={user?.fullName || undefined}
            onPress={() => router.push('/settings/edit-profile')}
          />
          <View className="h-px bg-border ml-[52px]" />
          {/* Usernames aren't editable — changing one would break every
              existing /creator/[username] link and share URL pointing at
              this person's profile. Shown read-only, grayed out. */}
          <SettingsRow
            icon={AtSign}
            label="Username"
            value={user ? `@${user.username}` : undefined}
            disabled
          />
          <View className="h-px bg-border ml-[52px]" />
          <SettingsRow icon={LogOut} label="Sign Out" destructive onPress={() => setSignOutVisible(true)} />
        </View>

        <SectionLabel>Preferences</SectionLabel>
        <View className="bg-surface mx-4 rounded-lg border border-border overflow-hidden">
          <SettingsRow
            icon={Moon}
            label="Dark Mode"
            right={
              <Switch
                value={darkMode}
                onValueChange={onToggleDarkMode}
                trackColor={{ false: '#2A2A2E', true: '#8B5CF6' }}
                thumbColor="#F5F5F0"
              />
            }
          />
          <View className="h-px bg-border ml-[52px]" />
          <SettingsRow
            icon={Bell}
            label="Notifications"
            right={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#2A2A2E', true: '#8B5CF6' }}
                thumbColor="#F5F5F0"
              />
            }
          />
        </View>

        {/* Storage section intentionally omitted — upload limits are fixed,
            developer-set constants (see MAX_IMAGE_MB / MAX_VIDEO_MB in
            app/(tabs)/upload.tsx) and there's no real storage-preference
            behavior to expose yet on Cloudinary's free tier. Revisit this
            once there's an actual paid-tier or usage-based reason to. */}

        <SectionLabel>About</SectionLabel>
        <View className="bg-surface mx-4 rounded-lg border border-border overflow-hidden">
          <SettingsRow icon={Info} label="About MemeDrop" onPress={() => {}} />
          <View className="h-px bg-border ml-[52px]" />
          <SettingsRow icon={Shield} label="Privacy Policy" onPress={() => {}} />
          <View className="h-px bg-border ml-[52px]" />
          <SettingsRow icon={FileText} label="Terms of Service" onPress={() => {}} />
          <View className="h-px bg-border ml-[52px]" />
          <SettingsRow icon={Flag} label="Report a Problem" onPress={() => {}} />
        </View>

        <Text className="text-text-muted text-xs text-center mt-8">MemeDrop v1.0.0</Text>
      </ScrollView>

      <ConfirmationModal
        visible={signOutVisible}
        title="Sign out of MemeDrop?"
        message="You'll need to sign back in to upload or see your saved memes."
        confirmLabel="Sign Out"
        destructive
        onConfirm={onConfirmSignOut}
        onCancel={() => setSignOutVisible(false)}
      />
    </SafeAreaView>
  );
}