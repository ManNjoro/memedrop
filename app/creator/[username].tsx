import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Inbox } from 'lucide-react-native';
import { Avatar } from '../../components/Avatar';
import { MediaCard, Meme } from '../../components/MediaCard';
import { EmptyState } from '../../components/EmptyState';
import { SkeletonGrid } from '../../components/SkeletonLoader';

type PublicCreator = {
  username: string;
  avatarUrl?: string | null;
  memeCount: number;
};

function getCreatorByUsername(username: string): PublicCreator {
  return { username, avatarUrl: null, memeCount: 127 };
}

function getCreatorUploads(username: string): Meme[] {
  return [
    {
      id: 'c1',
      title: 'Explaining my code to the rubber duck',
      mediaUrl: 'https://picsum.photos/seed/rubber-duck-2/700/900',
      mediaType: 'video',
      durationSec: 25,
      creatorName: username,
      creatorAvatar: null,
      uploadedAt: '2d ago',
      aspectRatio: 0.78,
    },
    {
      id: 'c2',
      title: 'When the linter finally passes',
      mediaUrl: 'https://picsum.photos/seed/linter-pass/700/850',
      mediaType: 'image',
      creatorName: username,
      creatorAvatar: null,
      uploadedAt: '4d ago',
      aspectRatio: 0.82,
    },
    {
      id: 'c3',
      title: 'Deploying on a Friday anyway',
      mediaUrl: 'https://picsum.photos/seed/friday-deploy-2/700/950',
      mediaType: 'image',
      creatorName: username,
      creatorAvatar: null,
      uploadedAt: '1w ago',
      aspectRatio: 0.74,
    },
    {
      id: 'c4',
      title: 'Onboarding a new dev to the codebase',
      mediaUrl: 'https://picsum.photos/seed/onboarding-dev/700/800',
      mediaType: 'video',
      durationSec: 19,
      creatorName: username,
      creatorAvatar: null,
      uploadedAt: '2w ago',
      aspectRatio: 0.88,
    },
  ];
}

export default function CreatorProfileScreen() {
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [username]);

  const creator = getCreatorByUsername(username ?? '');
  const uploads = getCreatorUploads(username ?? '');
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
        <View className="items-center px-6 pt-2 pb-6">
          <Avatar uri={creator.avatarUrl} name={creator.username} size="lg" />
          <Text className="text-text-primary text-lg font-bold mt-3">@{creator.username}</Text>
          <Text className="text-text-muted text-xs mt-1">{creator.memeCount} memes</Text>
        </View>

        <View className="px-4 pb-8">
          {loading ? (
            <SkeletonGrid count={4} />
          ) : uploads.length === 0 ? (
            <EmptyState icon={Inbox} title="No memes here yet" subtitle={`@${creator.username} hasn't dropped anything yet.`} />
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