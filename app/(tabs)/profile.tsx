import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser, useClerk } from '@clerk/expo';
import { Settings, Inbox, LogIn } from 'lucide-react-native';
import { Avatar } from '../../components/Avatar';
import { MediaCard, Meme } from '../../components/MediaCard';
import { EmptyState } from '../../components/EmptyState';
import { PrimaryButton } from '../../components/Buttons';
import { SafeAreaView } from '@/components/CustomSafeAreaView';

type ProfileTab = 'uploads' | 'saved';

// Placeholder — replace with a real fetch of this user's uploads/saved memes once the backend exists.
const MOCK_MY_MEMES: Meme[] = [
  {
    id: 'm1',
    title: 'When the demo actually works',
    mediaUrl: 'https://picsum.photos/seed/demo-works/700/900',
    mediaType: 'image',
    creatorName: 'you',
    creatorAvatar: null,
    uploadedAt: '3d ago',
    aspectRatio: 0.78,
  },
  {
    id: 'm2',
    title: 'Friday deploy energy',
    mediaUrl: 'https://picsum.photos/seed/friday-deploy/700/700',
    mediaType: 'video',
    durationSec: 12,
    creatorName: 'you',
    creatorAvatar: null,
    uploadedAt: '1w ago',
    aspectRatio: 1,
  },
];

function formatMemberSince(date: Date | null | undefined) {
  if (!date) return '';
  return `Member since ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const [tab, setTab] = useState<ProfileTab>('uploads');

  const memberSince = useMemo(
    () => formatMemberSince(user?.createdAt ? new Date(user.createdAt) : null),
    [user?.createdAt]
  );

  if (!isLoaded) {
    return <SafeAreaView className="flex-1 bg-bg" />;
  }

  if (!isSignedIn) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-bg">
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-surface-alt items-center justify-center mb-5">
            <LogIn size={30} color="#8B5CF6" strokeWidth={1.75} />
          </View>
          <Text className="text-text-primary text-lg font-bold text-center mb-1.5">
            Sign in to see your profile
          </Text>
          <Text className="text-text-secondary text-sm text-center leading-5 mb-6">
            Track your uploads, saved memes, and stats once you&apos;re signed in.
          </Text>
          <PrimaryButton
            label="Sign In"
            onPress={() => router.push('/(auth)/sign-in')}
            className="w-full max-w-60 mb-3"
          />
          <Pressable onPress={() => router.push('/(auth)/sign-up')}>
            <Text className="text-primary text-sm font-semibold">Create an account</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const uploads = tab === 'uploads' ? MOCK_MY_MEMES : [];
  const left = uploads.filter((_, i) => i % 2 === 0);
  const right = uploads.filter((_, i) => i % 2 === 1);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between px-4 pt-2 pb-1">
          <Text className="text-text-primary text-xl font-extrabold">Profile</Text>
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={8}
            accessibilityLabel="Settings"
            className="w-10 h-10 rounded-full bg-surface-alt items-center justify-center"
          >
            <Settings size={19} color="#F5F5F0" />
          </Pressable>
        </View>

        <View className="items-center px-6 pt-4 pb-6">
          <Avatar uri={user?.imageUrl} name={user?.username ?? 'you'} size="lg" />
          <Text className="text-text-primary text-lg font-bold mt-3">@{user?.username ?? 'you'}</Text>
          <Text className="text-text-muted text-xs mt-1">{memberSince}</Text>

          <View className="flex-row mt-6" style={{ gap: 32 }}>
            <View className="items-center">
              <Text className="text-text-primary text-lg font-extrabold">{MOCK_MY_MEMES.length}</Text>
              <Text className="text-text-muted text-xs mt-0.5">Uploads</Text>
            </View>
            <View className="items-center">
              <Text className="text-text-primary text-lg font-extrabold">312</Text>
              <Text className="text-text-muted text-xs mt-0.5">Downloads</Text>
            </View>
            <View className="items-center">
              <Text className="text-text-primary text-lg font-extrabold">1.2k</Text>
              <Text className="text-text-muted text-xs mt-0.5">Likes</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row px-4 border-b border-border mb-4">
          <Pressable
            onPress={() => setTab('uploads')}
            className={`flex-1 items-center pb-3 border-b-2 ${tab === 'uploads' ? 'border-primary' : 'border-transparent'}`}
          >
            <Text className={`text-sm font-bold ${tab === 'uploads' ? 'text-text-primary' : 'text-text-muted'}`}>
              My Memes
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('saved')}
            className={`flex-1 items-center pb-3 border-b-2 ${tab === 'saved' ? 'border-primary' : 'border-transparent'}`}
          >
            <Text className={`text-sm font-bold ${tab === 'saved' ? 'text-text-primary' : 'text-text-muted'}`}>
              Saved
            </Text>
          </Pressable>
        </View>

        <View className="px-4 pb-8">
          {uploads.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={tab === 'uploads' ? "You haven't dropped anything yet." : 'Nothing saved yet.'}
              subtitle={
                tab === 'uploads'
                  ? 'Your uploads will show up here once you drop your first meme.'
                  : 'Memes you save while browsing will show up here.'
              }
              actionLabel={tab === 'uploads' ? 'Upload Your First Meme' : undefined}
              onAction={tab === 'uploads' ? () => router.push('/(tabs)/upload') : undefined}
            />
          ) : (
            <View className="flex-row" style={{ gap: 12 }}>
              <View style={{ flex: 1 }}>
                {left.map((meme) => (
                  <MediaCard key={meme.id} meme={meme} variant="grid" onPress={() => router.push(`/meme/${meme.id}`)} />
                ))}
              </View>
              <View style={{ flex: 1 }}>
                {right.map((meme) => (
                  <MediaCard key={meme.id} meme={meme} variant="grid" onPress={() => router.push(`/meme/${meme.id}`)} />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}