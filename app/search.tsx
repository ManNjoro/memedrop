import ThemedSafeAreaView from '@/components/ThemedSafeAreaView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ChevronDown,
  SearchX,
  WifiOff,
} from 'lucide-react-native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import { BottomSheet, SheetOption } from '../components/BottomSheet';
import { FilterChip } from '../components/Chips';
import { EmptyState } from '../components/EmptyState';
import { MediaCard } from '../components/MediaCard';
import { SearchBar } from '../components/SearchBar';
import { SkeletonGrid } from '../components/SkeletonLoader';

import type { ApiMediaType, ApiMemeListItem, ApiSort } from '../lib/api/types';

import { useMemeFeed } from '../lib/hooks/useMemeFeed';
import { toCardMeme } from '../lib/mappers';

type MediaFilter = 'all' | 'images' | 'videos';

type SortOption =
  | 'Newest'
  | 'Oldest'
  | 'Most Downloaded'
  | 'Most Popular';

const SORT_OPTIONS: SortOption[] = [
  'Newest',
  'Oldest',
  'Most Downloaded',
  'Most Popular',
];

const SORT_TO_API: Record<SortOption, ApiSort> = {
  Newest: 'newest',
  Oldest: 'oldest',
  'Most Downloaded': 'most_downloaded',
  'Most Popular': 'most_popular',
};

const FILTER_TO_API: Record<
  MediaFilter,
  ApiMediaType | undefined
> = {
  all: undefined,
  images: 'image',
  videos: 'video',
};

type MemeRow = {
  id: string;
  left: ApiMemeListItem;
  right?: ApiMemeListItem;
};

export default function SearchResultsScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{ q?: string }>();

  const [query, setQuery] = useState(params.q ?? '');
  const [debouncedQuery, setDebouncedQuery] = useState(
    params.q ?? ''
  );

  const [filter, setFilter] =
    useState<MediaFilter>('all');

  const [sort, setSort] =
    useState<SortOption>('Newest');

  const [sheetOpen, setSheetOpen] =
    useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const iconColor = isDark
    ? '#F5F5F0'
    : '#121214';

  /*
   * Debounce search input.
   *
   * This prevents an API request for every
   * individual character typed.
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);

    return () => clearTimeout(timeout);
  }, [query]);

  /*
   * Infinite query.
   *
   * Changing q/filter/sort changes the query key
   * inside useMemeFeed, so TanStack Query starts
   * a new pagination sequence automatically.
   */
  const searchParams = useMemo(
    () => ({
      q: debouncedQuery,
      mediaType: FILTER_TO_API[filter],
      sort: SORT_TO_API[sort],
      limit: 20,
    }),
    [debouncedQuery, filter, sort]
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
  } = useMemeFeed(searchParams, {
    enabled: debouncedQuery.length > 0,
  });

  /*
   * Flatten all pages.
   *
   * Example:
   *
   * Page 1 = 20 memes
   * Page 2 = 20 memes
   * Page 3 = 20 memes
   *
   * memes = 60 memes
   */
  const memes = useMemo(
    () =>
      data?.pages.flatMap(
        (page) => page.memes
      ) ?? [],
    [data]
  );

  /*
   * Convert the flat list into two-column rows.
   *
   * [1,2,3,4,5]
   *
   * becomes:
   *
   * [
   *   { left: 1, right: 2 },
   *   { left: 3, right: 4 },
   *   { left: 5 }
   * ]
   */
  const rows = useMemo<MemeRow[]>(() => {
    const result: MemeRow[] = [];

    for (let i = 0; i < memes.length; i += 2) {
      result.push({
        id: memes[i].id,
        left: memes[i],
        right: memes[i + 1],
      });
    }

    return result;
  }, [memes]);

  /*
   * Load the next page.
   */
  const handleLoadMore = useCallback(() => {
    if (
      !hasNextPage ||
      isFetchingNextPage
    ) {
      return;
    }

    fetchNextPage();
  }, [
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  /*
   * Navigate to a meme.
   */
  const handleMemePress = useCallback(
    (id: string) => {
      router.push(`/meme/${id}`);
    },
    [router]
  );

  /*
   * Render one meme.
   */
  const renderMeme = useCallback(
    (item: ApiMemeListItem) => (
      <MediaCard
        meme={toCardMeme(item)}
        variant="grid"
        onPress={() =>
          handleMemePress(item.id)
        }
      />
    ),
    [handleMemePress]
  );

  /*
   * Render one two-column row.
   */
  const renderItem = useCallback(
    ({ item }: { item: MemeRow }) => (
      <View
        className="flex-row"
        style={{
          gap: 12,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ flex: 1 }}>
          {renderMeme(item.left)}
        </View>

        <View style={{ flex: 1 }}>
          {item.right
            ? renderMeme(item.right)
            : null}
        </View>
      </View>
    ),
    [renderMeme]
  );

  /*
   * Header containing the result count,
   * sorting and filters.
   */
  const renderListHeader = useCallback(() => {
    if (debouncedQuery.length === 0) {
      return null;
    }

    return (
      <>
        {/* Result count + sort */}
        <View className="px-4 flex-row items-center justify-between mb-3">
          <Text className="text-text-secondary text-sm font-medium">
            {isPending
              ? 'Searching…'
              : `${memes.length} meme${
                  memes.length === 1
                    ? ''
                    : 's'
                } found`}
          </Text>

          <Pressable
            onPress={() =>
              setSheetOpen(true)
            }
            className="flex-row items-center bg-surface-alt-light dark:bg-surface-alt rounded-lg px-3 py-1.5"
            accessibilityLabel="Change sort order"
          >
            <Text className="text-text-primary-light dark:text-text-primary text-xs font-semibold mr-1">
              Sort: {sort}
            </Text>

            <ChevronDown
              size={14}
              color={iconColor}
            />
          </Pressable>
        </View>

        {/* Filters */}
        <View className="px-4 flex-row mb-4">
          <FilterChip
            label="All"
            selected={filter === 'all'}
            onPress={() =>
              setFilter('all')
            }
          />

          <FilterChip
            label="Images"
            selected={filter === 'images'}
            onPress={() =>
              setFilter('images')
            }
          />

          <FilterChip
            label="Videos"
            selected={filter === 'videos'}
            onPress={() =>
              setFilter('videos')
            }
          />
        </View>
      </>
    );
  }, [
    debouncedQuery,
    isPending,
    memes.length,
    sort,
    filter,
    iconColor,
  ]);

  /*
   * Loading state.
   */
  const renderLoading = () => (
    <View className="px-4">
      <SkeletonGrid count={6} />
    </View>
  );

  /*
   * Empty / error states.
   */
  const renderEmpty = useCallback(() => {
    if (debouncedQuery.length === 0) {
      return (
        <EmptyState
          icon={SearchX}
          title="Search for something funny"
          subtitle='Try a topic, tag, or creator — like “programming” or “Kenyan memes.”'
        />
      );
    }

    if (isPending) {
      return renderLoading();
    }

    if (isError) {
      return (
        <EmptyState
          icon={WifiOff}
          title="Couldn't search right now"
          subtitle={
            error instanceof Error
              ? error.message
              : 'Something went wrong while searching.'
          }
          actionLabel="Try Again"
          onAction={() => refetch()}
        />
      );
    }

    if (memes.length === 0) {
      return (
        <EmptyState
          icon={SearchX}
          title="No memes found"
          subtitle="Try another search or browse trending memes."
          actionLabel="Explore Trending"
          onAction={() =>
            router.replace(
              '/(tabs)/explore'
            )
          }
        />
      );
    }

    return null;
  }, [
    debouncedQuery,
    isPending,
    isError,
    error,
    memes.length,
    refetch,
    router,
  ]);

  /*
   * Footer displayed while fetching another page.
   */
  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View className="py-4">
          <ActivityIndicator color="#8B5CF6" />
        </View>
      );
    }

    if (
      !hasNextPage &&
      memes.length > 0
    ) {
      return (
        <Text className="text-text-muted text-xs text-center py-4">
          You&apos;ve reached the end.
        </Text>
      );
    }

    return <View className="h-6" />;
  }, [
    isFetchingNextPage,
    hasNextPage,
    memes.length,
  ]);

  /*
   * Refresh.
   *
   * Don't show the pull-to-refresh spinner while
   * we're loading another pagination page.
   */
  const refreshing =
    isRefetching &&
    !isFetchingNextPage;

  return (
    <ThemedSafeAreaView>
      {/* Fixed header */}
      <View className="flex-row items-center px-4 pt-2 pb-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityLabel="Go back"
          className="mr-3"
        >
          <ArrowLeft
            size={22}
            color={iconColor}
          />
        </Pressable>

        <Text className="text-text-primary-light dark:text-text-primary text-xl font-extrabold">
          Search
        </Text>
      </View>

      {/* Search input */}
      <View className="px-4 mb-3">
        <SearchBar
          value={query}
          onChangeText={setQuery}
          autoFocus={!params.q}
          placeholder="Search memes…"
        />
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          renderListHeader
        }
        ListEmptyComponent={
          renderEmpty
        }
        ListFooterComponent={
          renderFooter
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 24,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => refetch()}
            tintColor="#8B5CF6"
          />
        }
        onEndReached={
          handleLoadMore
        }
        onEndReachedThreshold={0.5}
        removeClippedSubviews
        initialNumToRender={6}
        maxToRenderPerBatch={4}
        windowSize={7}
      />

      {/* Sort sheet */}
      <BottomSheet
        visible={sheetOpen}
        onClose={() =>
          setSheetOpen(false)
        }
        title="Sort by"
      >
        {SORT_OPTIONS.map((option) => (
          <SheetOption
            key={option}
            label={option}
            selected={sort === option}
            onPress={() => {
              setSort(option);
              setSheetOpen(false);
            }}
          />
        ))}
      </BottomSheet>
    </ThemedSafeAreaView>
  );
}