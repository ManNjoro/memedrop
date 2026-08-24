import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from '@/components/CustomSafeAreaView';
import { useUser } from '@clerk/expo';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { Avatar } from '../../components/Avatar';
import { PrimaryButton } from '../../components/Buttons';
import { useToast } from '../../components/Toast';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null); // local preview only until saved
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets?.[0]) return;

    const uri = result.assets[0].uri;
    setAvatarUri(uri); // show the new photo immediately, upload happens on Save

    if (!user) return;
    setUploadingAvatar(true);
    try {
      // @clerk/expo's setProfileImage expects a Blob, not a bare local URI —
      // fetch() against a file:// URI in React Native returns one directly.
      const response = await fetch(uri);
      const blob = await response.blob();
      await user.setProfileImage({ file: blob });
      showToast({ message: 'Profile photo updated', variant: 'success' });
    } catch {
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
      showToast({ message: 'Profile updated', variant: 'success' });
      router.back();
    } catch {
      showToast({ message: 'Couldn\u2019t save your changes. Try again.', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-row items-center px-4 pt-2 pb-3">
          <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Go back" className="mr-3">
            <ArrowLeft size={22} color="#F5F5F0" />
          </Pressable>
          <Text className="text-text-primary text-xl font-extrabold">Edit Profile</Text>
        </View>

        <ScrollView className="px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <View className="items-center py-6">
            <Pressable onPress={onChangeAvatar} disabled={uploadingAvatar} accessibilityLabel="Change profile photo">
              <Avatar uri={avatarUri ?? user?.imageUrl} name={user?.username ?? 'you'} size="lg" />
              <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary items-center justify-center border-2 border-bg">
                <Camera size={13} color="#F5F5F0" />
              </View>
            </Pressable>
            <Text className="text-text-muted text-xs mt-3">
              {uploadingAvatar ? 'Uploading…' : 'Tap to change photo'}
            </Text>
          </View>

          <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wide mb-2">
            First name
          </Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            placeholderTextColor="#6B6B72"
            maxLength={50}
            className="bg-surface-alt border border-border rounded-lg px-4 py-3.5 text-text-primary text-base mb-5"
          />

          <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wide mb-2">
            Last name
          </Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            placeholderTextColor="#6B6B72"
            maxLength={50}
            className="bg-surface-alt border border-border rounded-lg px-4 py-3.5 text-text-primary text-base mb-5"
          />

          {/* Username intentionally isn't editable here — see the grayed-out
              row on the Settings screen for why. */}
          <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wide mb-2">
            Username
          </Text>
          <View className="bg-surface border border-border rounded-lg px-4 py-3.5 mb-6 opacity-50">
            <Text className="text-text-primary text-base">@{user?.username}</Text>
          </View>

          <PrimaryButton label="Save Changes" onPress={onSave} disabled={!isDirty} loading={saving} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}