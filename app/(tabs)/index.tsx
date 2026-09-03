import ThemedSafeAreaView from '@/components/ThemedSafeAreaView';
import { useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { Search, WifiOff } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Share,
  Text,
  useColorScheme,
  View,
} from 'react-native';

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
import type { ApiMemeListItem } from '../../lib/api/types';

const CATEGORIES = [
  'Trending',
  'Latest',
  'Videos',
  'Images',
  'Popular',
] as const;

type Category = (typeof CATEGORIES)[number];

function paramsForCategory(category: Category): FetchMemesParams {
  switch (category) {
    case 'Trending':
      return {
        sort: 'most_popular',
        limit: 10,
      };

    case 'Latest':
      return {
        sort: 'newest',
        limit: 10,
      };

    case 'Videos':
      return {
        mediaType: 'video',
        sort: 'newest',
        limit: 10,
      };

    case 'Images':
      return {
        mediaType: 'image',
        sort: 'newest',
        limit: 10,
      };

    case 'Popular':
      return {
        sort: 'most_downloaded',
        limit: 10,
      };
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { showToast } = useToast();

  const [activeCategory, setActiveCategory] =
    useState<Category>('Trending');

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const iconColor = isDark ? '#F5F5F0' : '#121214';

  const params = useMemo(
    () => paramsForCategory(activeCategory),
    [activeCategory],
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMemeFeed(params);

  /**
   * Flatten all React Query pages into one array.
   *
   * Example:
   *
   * pages:
   * [
   *   { memes: [1..10] },
   *   { memes: [11..20] },
   *   { memes: [21..30] }
   * ]
   *
   * becomes:
   *
   * [1..30]
   */
  const memes = useMemo(
    () => data?.pages.flatMap((page) => page.memes) ?? [],
    [data],
  );

  const [featured, ...rest] = memes;

  const featuredCard = featured
    ? toCardMeme(featured)
    : null;

  const onDownload = async (id: string) => {
    try {
      await recordDownload(id);

      showToast({
        message: 'Download started',
        variant: 'success',
      });
    } catch {
      showToast({
        message: 'Couldn’t start the download. Try again.',
        variant: 'error',
      });
    }
  };

  const onShare = async (meme: ApiMemeListItem) => {
    const shareUrl = meme.mediaUrl;

    try {
      await Share.share({
        message: `Check this out on MemeDrop: ${shareUrl}`,
      });
    } catch {
      // User cancelled share dialog or sharing failed.
    }
  };

  const handleLoadMore = () => {
    /**
     * FlatList can call onEndReached more than once.
     *
     * These checks prevent duplicate requests.
     */
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    fetchNextPage();
  };

  /**
   * Everything above the actual meme cards.
   *
   * This is rendered once as FlatList's header.
   */
  const renderHeader = () => {
    return (
      <>
        {/* Top bar */}
        <View className="flex-row items-center justify-between px-4 pt-2 pb-4">
          <Text className="text-text-primary-light dark:text-text-primary text-2xl font-extrabold">
            Meme
            <Text className="text-primary">Drop</Text>
          </Text>

          <View className="flex-row items-center">
            <Pressable
              onPress={() => router.push('/search')}
              hitSlop={8}
              accessibilityLabel="Search"
              className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-surface-alt-light dark:bg-surface-alt"
            >
              <Search
                size={20}
                color={iconColor}
              />
            </Pressable>

            <Pressable
              onPress={() => router.push('/(tabs)/profile')}
              accessibilityLabel="Your profile"
            >
              <Avatar
                uri={user?.imageUrl}
                name={user?.username ?? 'You'}
                size="sm"
              />
            </Pressable>
          </View>
        </View>

        {/* Hero greeting */}
        <View className="mb-5 px-4">
          <Text className="text-text-primary-light dark:text-text-primary text-[26px] font-extrabold leading-8">
            Your daily dose{'\n'}
            of internet chaos.
          </Text>
        </View>

        {/* Category rail */}
        <FlatList
          data={CATEGORIES}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingRight: 16,
          }}
          className="mb-5"
          renderItem={({ item: cat }) => (
            <CategoryChip
              label={cat}
              selected={activeCategory === cat}
              onPress={() => setActiveCategory(cat)}
            />
          )}
        />

        {/* Featured meme */}
        {featuredCard && (
          <Pressable
            onPress={() =>
              router.push(`/meme/${featuredCard.id}`)
            }
            className="mx-4 mb-5 overflow-hidden rounded-lg bg-surface-light dark:bg-surface"
          >
            <Image
              source={{
                uri:
                  featuredCard.mediaUrl
              }}
              style={{
                width: '100%',
                height: 260,
              }}
              resizeMode="cover"
            />

            <View className="absolute bottom-0 left-0 right-0 bg-black/40 px-4 py-3">
              <Text className="mb-1 text-xs font-bold uppercase tracking-wide text-text-primary">
                🔥 Featured
              </Text>

              <Text className="text-lg font-bold text-text-primary">
                {featuredCard.title}
              </Text>
            </View>
          </Pressable>
        )}
      </>
    );
  };

  /**
   * Footer displayed while another page is being loaded.
   */
  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View className="px-4 py-4">
          <SkeletonFeedList count={2} />
        </View>
      );
    }

    if (!hasNextPage && memes.length > 0) {
      return (
        <View className="items-center py-6">
          <Text className="text-xs text-text-muted">
            You&apos;ve reached the end.
          </Text>
        </View>
      );
    }

    return <View className="h-6" />;
  };

  /**
   * Initial loading state.
   */
  if (isLoading) {
    return (
      <ThemedSafeAreaView>
        <View className="flex-1 px-4">
          <SkeletonFeedList count={3} />
        </View>
      </ThemedSafeAreaView>
    );
  }

  /**
   * Initial error state.
   */
  if (isError) {
    return (
      <ThemedSafeAreaView>
        <EmptyState
          icon={WifiOff}
          title="Couldn't load your feed"
          subtitle={
            error instanceof Error
              ? error.message
              : 'Something went wrong. Check your connection.'
          }
          actionLabel="Try Again"
          onAction={() => refetch()}
        />
      </ThemedSafeAreaView>
    );
  }

  /**
   * Empty state.
   */
  if (memes.length === 0) {
    return (
      <ThemedSafeAreaView>
        <EmptyState
          icon={WifiOff}
          title="Nothing dropped here yet."
          subtitle="Be the first to drop a meme in this category."
        />
      </ThemedSafeAreaView>
    );
  }

  return (
    <ThemedSafeAreaView>
      <FlatList<ApiMemeListItem>
        data={rest}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="px-4">
            <MediaCard
              meme={toCardMeme(item)}
              variant="feed"
              onPress={() =>
                router.push(`/meme/${item.id}`)
              }
              onDownload={() => onDownload(item.id)}
              onShare={() => onShare(item)}
            />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={() => refetch()}
            tintColor="#8B5CF6"
          />
        }
        contentContainerStyle={{
          paddingBottom: 24,
        }}
        /**
         * Helps FlatList calculate item positions.
         * Adjust/remove if MediaCard has highly variable heights.
         */
        removeClippedSubviews
      />
    </ThemedSafeAreaView>
  );
}