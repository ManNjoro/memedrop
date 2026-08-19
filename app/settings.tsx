import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router'
import { useClerk, useUser } from '@clerk/expo';
import {
  ArrowLeft,
  User,
  AtSign,
  LogOut,
  Moon,
  Bell,
  Database,
  Download,
  Info,
  Shield,
  FileText,
  Flag,
  ChevronRight,
} from 'lucide-react-native';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useToast } from '../components/Toast';
import { SafeAreaView } from '@/components/CustomSafeAreaView';

type RowProps = {
  icon: React.ElementType;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  right?: React.ReactNode;
};

function SettingsRow({ icon: Icon, label, value, onPress, destructive, right }: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      className="flex-row items-center px-4 py-3.5 active:bg-surface-alt"
    >
      <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${destructive ? 'bg-danger/15' : 'bg-surface-alt'}`}>
        <Icon size={16} color={destructive ? '#F5484B' : '#A3A3AA'} />
      </View>
      <Text className={`flex-1 text-sm font-medium ${destructive ? 'text-danger' : 'text-text-primary'}`}>
        {label}
      </Text>
      {right ??
        (onPress && (
          <View className="flex-row items-center">
            {!!value && <Text className="text-text-muted text-xs mr-1.5">{value}</Text>}
            <ChevronRight size={16} color="#6B6B72" />
          </View>
        ))}
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
          <SettingsRow icon={User} label="Edit Profile" value={user?.fullName ?? undefined} onPress={() => {}} />
          <View className="h-px bg-border ml-13" />
          <SettingsRow icon={AtSign} label="Change Username" value={user ? `@${user.username}` : undefined} onPress={() => {}} />
          <View className="h-px bg-border ml-13" />
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
                onValueChange={setDarkMode}
                trackColor={{ false: '#2A2A2E', true: '#8B5CF6' }}
                thumbColor="#F5F5F0"
              />
            }
          />
          <View className="h-px bg-border ml-13" />
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

        <SectionLabel>Storage</SectionLabel>
        <View className="bg-surface mx-4 rounded-lg border border-border overflow-hidden">
          <SettingsRow icon={Database} label="Upload Limits" value="Images 10MB · Video 50MB" onPress={() => {}} />
          <View className="h-px bg-border ml-13" />
          <SettingsRow icon={Download} label="Download Preferences" onPress={() => {}} />
        </View>

        <SectionLabel>About</SectionLabel>
        <View className="bg-surface mx-4 rounded-lg border border-border overflow-hidden">
          <SettingsRow icon={Info} label="About MemeDrop" onPress={() => {}} />
          <View className="h-px bg-border ml-13" />
          <SettingsRow icon={Shield} label="Privacy Policy" onPress={() => {}} />
          <View className="h-px bg-border ml-13" />
          <SettingsRow icon={FileText} label="Terms of Service" onPress={() => {}} />
          <View className="h-px bg-border ml-13" />
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