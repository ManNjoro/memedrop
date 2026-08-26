import ThemedSafeAreaView from '@/components/ThemedSafeAreaView';
import { useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { Search, WifiOff } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, Share, Text, useColorScheme, View } from 'react-native';
import { Avatar } from '../../components/Avatar';
import { CategoryChip } from '../../components/Chips';
import { EmptyState } from '../../components/EmptyState';
import { MediaCard } from '../../components/MediaCard';
import { SkeletonFeedList } from '../../components/SkeletonLoader';
import { useToast } from '../../components/Toast';
import type { FetchMemesParams } from '../../lib/api/memes';
import { recordDownload } from '../../lib/api/memes';
import { useMemeFeed } from '../../lib/hooks/useMemeFeed';
import { toCardMeme } from '../../lib/mappers';
import { ApiMemeListItem } from '@/lib/api/types';

const CATEGORIES = ['Trending', 'Latest', 'Videos', 'Images', 'Popular'] as const;
type Category = (typeof CATEGORIES)[number];

function paramsForCategory(category: Category): FetchMemesParams {
  switch (category) {
    case 'Trending':
      return { sort: 'most_popular', limit: 10 };
    case 'Latest':
      return { sort: 'newest', limit: 10 };
    case 'Videos':
      return { mediaType: 'video', sort: 'newest', limit: 10 };
    case 'Images':
      return { mediaType: 'image', sort: 'newest', limit: 10 };
    case 'Popular':
      return { sort: 'most_downloaded', limit: 10 };
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState<Category>('Trending');
  const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
  
    const iconColor = isDark ? "#F5F5F0" : "#121214";

  const params = useMemo(() => paramsForCategory(activeCategory), [activeCategory]);
  const { memes, loading, refreshing, error, refresh } = useMemeFeed(params);

  const onDownload = async (id: string) => {
    try {
      await recordDownload(id);
      showToast({ message: 'Download started', variant: 'success' });
    } catch {
      showToast({ message: 'Couldn\u2019t start the download. Try again.', variant: 'error' });
    }
  };

  const onShare = async (meme: ApiMemeListItem) => {
    const shareUrl = meme ? `${meme.mediaUrl}` : '';
      try {
        await Share.share({ message: `Check this out on MemeDrop: ${shareUrl}` });
      } catch {}
    };

  const [featured, ...rest] = memes;

  return (
    <ThemedSafeAreaView>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#8B5CF6" />}
      >
        {/* Top bar */}
        <View className="flex-row items-center justify-between px-4 pt-2 pb-4">
          <Text className="text-text-primary-light dark:text-text-primary text-2xl font-extrabold">
            Meme<Text className="text-primary">Drop</Text>
          </Text>
          <View className="flex-row items-center">
            <Pressable
              onPress={() => router.push('/search')}
              hitSlop={8}
              accessibilityLabel="Search"
              className="w-10 h-10 rounded-full bg-surface-alt-light dark:bg-surface-alt items-center justify-center mr-3"
            >
              <Search size={20} color={iconColor} />
            </Pressable>
            <Pressable onPress={() => router.push('/(tabs)/profile')} accessibilityLabel="Your profile">
              <Avatar uri={user?.imageUrl} name={user?.username ?? 'You'} size="sm" />
            </Pressable>
          </View>
        </View>

        {/* Hero greeting */}
        <View className="px-4 mb-5">
          <Text className="text-text-primary-light dark:text-text-primary text-[26px] font-extrabold leading-8">
            Your daily dose{'\n'}of internet chaos.
          </Text>
        </View>

        {/* Category rail */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 mb-5"
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              selected={activeCategory === cat}
              onPress={() => setActiveCategory(cat)}
            />
          ))}
        </ScrollView>

        {loading ? (
          <View className="px-4">
            <SkeletonFeedList count={3} />
          </View>
        ) : error ? (
          <EmptyState icon={WifiOff} title="Couldn't load your feed" subtitle={error} actionLabel="Try Again" onAction={refresh} />
        ) : memes.length === 0 ? (
          <EmptyState
            icon={WifiOff}
            title="Nothing dropped here yet."
            subtitle="Be the first to drop a meme in this category."
          />
        ) : (
          <>
            {/* Featured card — the top result for the active category */}
            {featured && (
              <Pressable
                onPress={() => router.push(`/meme/${featured.id}`)}
                className="mx-4 mb-5 rounded-lg overflow-hidden bg-surface-light dark:bg-surface"
              >
                <Image
                  source={{ uri: toCardMeme(featured).mediaUrl }}
                  style={{ width: '100%', height: 260 }}
                  resizeMode="cover"
                />
                <View className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-black/40">
                  <Text className="text-text-primary text-xs font-bold uppercase tracking-wide mb-1">
                    🔥 Featured
                  </Text>
                  <Text className="text-text-primary text-lg font-bold">{featured.title}</Text>
                </View>
              </Pressable>
            )}

            {/* Feed */}
            <View className="px-4 pb-6">
              {rest.map((item) => (
                <MediaCard
                  key={item.id}
                  meme={toCardMeme(item)}
                  variant="feed"
                  onPress={() => router.push(`/meme/${item.id}`)}
                  onDownload={() => onDownload(item.id)}
                  onShare={() => {onShare(item)}}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </ThemedSafeAreaView>
  );
}