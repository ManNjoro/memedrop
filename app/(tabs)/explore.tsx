import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/expo';
import { Search, WifiOff } from 'lucide-react-native';

import { CategoryChip } from '../../components/Chips';
import { MediaCard } from '../../components/MediaCard';
import { Avatar } from '../../components/Avatar';
import { EmptyState } from '../../components/EmptyState';
import { SkeletonFeedList } from '../../components/SkeletonLoader';
import { useMemeFeed } from '../../lib/hooks/useMemeFeed';
import { toCardMeme } from '../../lib/mappers';
import { recordDownload } from '../../lib/api/memes';
import { useToast } from '../../components/Toast';
import type { FetchMemesParams } from '../../lib/api/memes';
import type { ApiMemeListItem } from '../../lib/api/types';
import { SafeAreaView } from '@/components/CustomSafeAreaView';

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

  const params = useMemo(
    () => paramsForCategory(activeCategory),
    [activeCategory]
  );

  const {
    data,
    isPending,
    isRefetching,
    isFetchingNextPage,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useMemeFeed(params);

  /*
   * Flatten all pages into one array.
   *
   * Example:
   *
   * page 1 -> 10 memes
   * page 2 -> 10 memes
   * page 3 -> 10 memes
   *
   * memes -> 30 memes
   */
  const memes = useMemo(
    () => data?.pages.flatMap((page) => page.memes) ?? [],
    [data]
  );

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

  const handleLoadMore = () => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    fetchNextPage();
  };

  /*
   * First item is displayed as the featured meme.
   * Everything after it is displayed in the normal feed.
   */
  const featured = memes[0];

  const renderHeader = () => {
    /*
     * During the initial request, show the skeleton instead
     * of the normal header/feed.
     */
    if (isPending) {
      return (
        <>
          {/* Top bar */}
          <View className="flex-row items-center justify-between px-4 pt-2 pb-4">
            <Text className="text-text-primary-light dark:text-text-primary text-2xl font-extrabold">
              Meme<Text className="text-primary">Drop</Text>
            </Text>

            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-surface-alt-light dark:bg-surface-alt mr-3" />

              <Avatar
                uri={user?.imageUrl}
                name={user?.username ?? 'You'}
                size="sm"
              />
            </View>
          </View>

          {/* Hero greeting */}
          <View className="px-4 mb-5">
            <Text className="text-text-primary-light dark:text-text-primary text-[26px] font-extrabold leading-8">
              Your daily dose{'\n'}of internet chaos.
            </Text>
          </View>

          {/* Categories */}
          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingRight: 16,
              marginBottom: 20,
            }}
            renderItem={({ item }) => (
              <CategoryChip
                label={item}
                selected={activeCategory === item}
                onPress={() => setActiveCategory(item)}
              />
            )}
          />

          <View className="px-4">
            <SkeletonFeedList count={3} />
          </View>
        </>
      );
    }

    /*
     * Error state.
     */
    if (isError) {
      return (
        <>
          {/* Keep the top UI available */}
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
                <Search size={20} color="#F5F5F0" />
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

          <View className="px-4 mb-5">
            <Text className="text-text-primary-light dark:text-text-primary text-[26px] font-extrabold leading-8">
              Your daily dose{'\n'}of internet chaos.
            </Text>
          </View>

          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingRight: 16,
              marginBottom: 20,
            }}
            renderItem={({ item }) => (
              <CategoryChip
                label={item}
                selected={activeCategory === item}
                onPress={() => setActiveCategory(item)}
              />
            )}
          />

          <EmptyState
            icon={WifiOff}
            title="Couldn't load your feed"
            subtitle={
              error instanceof Error
                ? error.message
                : 'Something went wrong while loading your memes.'
            }
            actionLabel="Try Again"
            onAction={() => refetch()}
          />
        </>
      );
    }

    /*
     * Empty state.
     */
    if (memes.length === 0) {
      return (
        <>
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
                <Search size={20} color="#F5F5F0" />
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

          {/* Hero */}
          <View className="px-4 mb-5">
            <Text className="text-text-primary-light dark:text-text-primary text-[26px] font-extrabold leading-8">
              Your daily dose{'\n'}of internet chaos.
            </Text>
          </View>

          {/* Categories */}
          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingRight: 16,
              marginBottom: 20,
            }}
            renderItem={({ item }) => (
              <CategoryChip
                label={item}
                selected={activeCategory === item}
                onPress={() => setActiveCategory(item)}
              />
            )}
          />

          <EmptyState
            icon={WifiOff}
            title="Nothing dropped here yet."
            subtitle="Be the first to drop a meme in this category."
          />
        </>
      );
    }

    /*
     * Normal header.
     */
    return (
      <>
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
              <Search size={20} color="#F5F5F0" />
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
        <View className="px-4 mb-5">
          <Text className="text-text-primary-light dark:text-text-primary text-[26px] font-extrabold leading-8">
            Your daily dose{'\n'}of internet chaos.
          </Text>
        </View>

        {/* Category rail */}
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingRight: 16,
            marginBottom: 20,
          }}
          renderItem={({ item }) => (
            <CategoryChip
              label={item}
              selected={activeCategory === item}
              onPress={() => setActiveCategory(item)}
            />
          )}
        />

        {/* Featured card */}
        {featured && (
          <Pressable
            onPress={() => router.push(`/meme/${featured.id}`)}
            className="mx-4 mb-5 rounded-lg overflow-hidden bg-surface"
          >
            <Image
              source={{
                uri: toCardMeme(featured).mediaUrl,
              }}
              style={{
                width: '100%',
                height: 260,
              }}
              resizeMode="cover"
            />

            <View className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-black/40">
              <Text className="text-text-primary text-xs font-bold uppercase tracking-wide mb-1">
                🔥 Featured
              </Text>

              <Text className="text-text-primary text-lg font-bold">
                {featured.title}
              </Text>
            </View>
          </Pressable>
        )}
      </>
    );
  };

  /*
   * Normal feed items.
   *
   * The first meme is featured in ListHeaderComponent,
   * so FlatList receives everything after it.
   */
  const feedMemes = useMemo(
    () => memes.slice(1),
    [memes]
  );

  const renderItem = ({
    item,
  }: {
    item: ApiMemeListItem;
  }) => (
    <MediaCard
      meme={toCardMeme(item)}
      variant="feed"
      onPress={() => router.push(`/meme/${item.id}`)}
      onDownload={() => onDownload(item.id)}
      onShare={() => {}}
    />
  );

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View className="px-4 pt-2 pb-6">
          <SkeletonFeedList count={2} />
        </View>
      );
    }

    if (!hasNextPage && memes.length > 0) {
      return (
        <View className="items-center py-6">
          <Text className="text-text-secondary-light dark:text-text-secondary text-sm">
            You&apos;ve reached the end.
          </Text>
        </View>
      );
    }

    return <View className="h-6" />;
  };

  return (
    <SafeAreaView
      edges={['top']}
      className="flex-1 bg-bg-light dark:bg-bg"
    >
      <FlatList
        data={feedMemes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 16,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={() => refetch()}
            tintColor="#8B5CF6"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
}