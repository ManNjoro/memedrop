// app/creator/[username].tsx
// Public, read-only profile — reachable by anyone, signed in or not (see app/_layout.tsx).
// Only ever show what's public: avatar, username, upload count, and their uploads.
// Never surface email, private stats, or settings here.
import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ImageOff } from 'lucide-react-native';
import { Avatar } from '../../components/Avatar';
import { MediaCard, Meme } from '../../components/MediaCard';
import { EmptyState } from '../../components/EmptyState';

// Replace with a real fetch-by-username from your API once the backend exists.
function getCreatorByUsername(username: string) {
  return {
    username,
    avatarUrl: null as string | null,
    memeCount: 127,
  };
}

function getUploadsForCreator(username: string): Meme[] {
  return [
    {
      id: 'c1',
      title: 'When the demo actually works',
      mediaUrl: `https://picsum.photos/seed/${username}-1/700/900`,
      mediaType: 'image',
      creatorName: username,
      creatorAvatar: null,
      uploadedAt: '2d ago',
      aspectRatio: 0.78,
    },
    {
      id: 'c2',
      title: 'Explaining recursion, again',
      mediaUrl: `https://picsum.photos/seed/${username}-2/700/700`,
      mediaType: 'video',
      durationSec: 18,
      creatorName: username,
      creatorAvatar: null,
      uploadedAt: '5d ago',
      aspectRatio: 1,
    },
    {
      id: 'c3',
      title: 'That one WhatsApp group',
      mediaUrl: `https://picsum.photos/seed/${username}-3/700/950`,
      mediaType: 'image',
      creatorName: username,
      creatorAvatar: null,
      uploadedAt: '1w ago',
      aspectRatio: 0.74,
    },
    {
      id: 'c4',
      title: 'Monday, again',
      mediaUrl: `https://picsum.photos/seed/${username}-4/700/850`,
      mediaType: 'image',
      creatorName: username,
      creatorAvatar: null,
      uploadedAt: '2w ago',
      aspectRatio: 0.82,
    },
  ];
}

export default function CreatorProfileScreen() {
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const creator = getCreatorByUsername(username ?? '');
  const uploads = getUploadsForCreator(username ?? '');

  const left = uploads.filter((_, i) => i % 2 === 0);
  const right = uploads.filter((_, i) => i % 2 === 1);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <View className="flex-row items-center px-4 pt-2 pb-3">
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Go back" className="mr-3">
          <ArrowLeft size={22} color="#F5F5F0" />
        </Pressable>
        <Text className="text-text-primary text-xl font-extrabold">Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="items-center px-6 pt-3 pb-6">
          <Avatar uri={creator.avatarUrl} name={creator.username} size="lg" />
          <Text className="text-text-primary text-lg font-bold mt-3">@{creator.username}</Text>
          <Text className="text-text-muted text-xs mt-1">{creator.memeCount} memes</Text>
        </View>

        <View className="px-4 pb-8">
          {uploads.length === 0 ? (
            <EmptyState
              icon={ImageOff}
              title="No memes here yet"
              subtitle={`@${creator.username} hasn't dropped anything yet.`}
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