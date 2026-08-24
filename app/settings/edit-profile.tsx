import ThemedSafeAreaView from '@/components/ThemedSafeAreaView';
import { useUser } from '@clerk/expo';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { usePostHog } from 'posthog-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, useColorScheme, View } from 'react-native';
import { Avatar } from '../../components/Avatar';
import { PrimaryButton } from '../../components/Buttons';
import { useToast } from '../../components/Toast';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { showToast } = useToast();
  const posthog = usePostHog();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null); // local preview only until saved
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
  
    const iconColor = isDark ? "#F5F5F0" : "#121214";

  const isDirty =
    firstName !== (user?.firstName ?? '') || lastName !== (user?.lastName ?? '') || avatarUri !== null;

  const onChangeAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast({ message: 'Allow gallery access to change your photo.', variant: 'error' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true, // Clerk accepts base64 files
    });
    if (result.canceled || !result.assets?.[0]) return;

    const uri = result.assets[0].uri;
    const asset = result.assets[0];
    const base64File = `data:${asset.mimeType};base64,${asset.base64}`;

    setAvatarUri(uri); // show the new photo immediately, upload happens on Save

    if (!user) return;
    setUploadingAvatar(true);
    try {
      // @clerk/expo's setProfileImage expects a Blob, not a bare local URI —
      // fetch() against a file:// URI in React Native returns one directly.
      // const response = await fetch(uri);
      // const blob = await response.blob();
      await user.setProfileImage({ file: base64File });
      showToast({ message: 'Profile photo updated', variant: 'success' });
    } catch (err) {
      console.error(err)
      showToast({ message: 'Couldn\u2019t update your photo. Try again.', variant: 'error' });
      setAvatarUri(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSave = async () => {
    if (!user || !isDirty) return;
    setSaving(true);
    try {
      await user.update({ firstName: firstName.trim(), lastName: lastName.trim() });
      posthog.capture('profile_updated', { avatar_changed: avatarUri !== null });
      showToast({ message: 'Profile updated', variant: 'success' });
      router.back();
    } catch {
      showToast({ message: 'Couldn\u2019t save your changes. Try again.', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedSafeAreaView>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-row items-center px-4 pt-2 pb-3">
          <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Go back" className="mr-3">
            <ArrowLeft size={22} color={iconColor} />
          </Pressable>
          <Text className="text-text-primary-light dark:text-text-primary text-xl font-extrabold">Edit Profile</Text>
        </View>

        <ScrollView className="px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <View className="items-center py-6">
            <Pressable onPress={onChangeAvatar} disabled={uploadingAvatar} accessibilityLabel="Change profile photo">
              <Avatar uri={avatarUri ?? user?.imageUrl} name={user?.username ?? 'you'} size="lg" />
              <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary items-center justify-center border-2 border-bg-light dark:border-bg">
                <Camera size={13} color={iconColor} />
              </View>
            </Pressable>
            <Text className="text-text-muted text-xs mt-3">
              {uploadingAvatar ? 'Uploading…' : 'Tap to change photo'}
            </Text>
          </View>

          <Text className="text-text-secondary-light dark:text-text-secondary text-xs font-semibold uppercase tracking-wide mb-2">
            First name
          </Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            placeholderTextColor="#6B6B72"
            maxLength={50}
            className="bg-surface-alt-light dark:bg-surface-alt border border-border-light dark:border-border rounded-lg px-4 py-3.5 text-text-primary-light dark:text-text-primary text-base mb-5"
          />

          <Text className="text-text-secondary-light dark:text-text-secondary text-xs font-semibold uppercase tracking-wide mb-2">
            Last name
          </Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            placeholderTextColor="#6B6B72"
            maxLength={50}
            className="bg-surface-alt-light dark:bg-surface-alt border border-border-light dark:border-border rounded-lg px-4 py-3.5 text-text-primary-light dark:text-text-primary text-base mb-5"
          />

          {/* Username intentionally isn't editable here — see the grayed-out
              row on the Settings screen for why. */}
          <Text className="text-text-secondary-light dark:text-text-secondary text-xs font-semibold uppercase tracking-wide mb-2">
            Username
          </Text>
          <View className="bg-surface-light dark:bg-surface border border-border-light dark:border-border rounded-lg px-4 py-3.5 mb-6 opacity-50">
            <Text className="text-text-primary-light dark:text-text-primary text-base">@{user?.username}</Text>
          </View>

          <PrimaryButton label="Save Changes" onPress={onSave} disabled={!isDirty} loading={saving} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedSafeAreaView>
  );
}