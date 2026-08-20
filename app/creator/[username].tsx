import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Inbox, WifiOff } from 'lucide-react-native';
import { Avatar } from '../../components/Avatar';
import { MediaCard } from '../../components/MediaCard';
import { EmptyState } from '../../components/EmptyState';
import { SkeletonGrid } from '../../components/SkeletonLoader';
import { useUserWithMemes } from '../../lib/hooks/useUserWithMemes';
import { toCardMemeFromUserItem } from '../../lib/mappers';

export default function CreatorProfileScreen() {
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const { profile, memes, loading, error, refresh } = useUserWithMemes(username);

  const left = memes.filter((_, i) => i % 2 === 0);
  const right = memes.filter((_, i) => i % 2 === 1);

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
          <Avatar uri={profile?.avatarUrl} name={username ?? '?'} size="lg" />
          <Text className="text-text-primary text-lg font-bold mt-3">@{username}</Text>
          {!loading && !error && (
            <Text className="text-text-muted text-xs mt-1">{profile?.memeCount ?? 0} memes</Text>
          )}
        </View>

        <View className="px-4 pb-8">
          {loading ? (
            <SkeletonGrid count={4} />
          ) : error ? (
            <EmptyState icon={WifiOff} title="Couldn't load this profile" subtitle={error} actionLabel="Try Again" onAction={refresh} />
          ) : memes.length === 0 ? (
            <EmptyState icon={Inbox} title="No memes here yet" subtitle={`@${username} hasn't dropped anything yet.`} />
          ) : (
            <View className="flex-row" style={{ gap: 12 }}>
              <View style={{ flex: 1 }}>
                {left.map((item) => (
                  <MediaCard
                    key={item.id}
                    meme={toCardMemeFromUserItem(item, username ?? '', profile?.avatarUrl)}
                    variant="grid"
                    onPress={() => router.push(`/meme/${item.id}`)}
                  />
                ))}
              </View>
              <View style={{ flex: 1 }}>
                {right.map((item) => (
                  <MediaCard
                    key={item.id}
                    meme={toCardMemeFromUserItem(item, username ?? '', profile?.avatarUrl)}
                    variant="grid"
                    onPress={() => router.push(`/meme/${item.id}`)}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}