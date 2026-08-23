import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from '@/components/CustomSafeAreaView';
import { ArrowLeft, ChevronDown, SearchX, WifiOff } from 'lucide-react-native';
import { SearchBar } from '../components/SearchBar';
import { FilterChip } from '../components/Chips';
import { MediaCard } from '../components/MediaCard';
import { SkeletonGrid } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { BottomSheet, SheetOption } from '../components/BottomSheet';
import { useMemeFeed } from '../lib/hooks/useMemeFeed';
import { toCardMeme } from '../lib/mappers';
import type { ApiMediaType, ApiSort } from '../lib/api/types';

type MediaFilter = 'all' | 'images' | 'videos';
type SortOption = 'Newest' | 'Oldest' | 'Most Downloaded' | 'Most Popular';

const SORT_OPTIONS: SortOption[] = ['Newest', 'Oldest', 'Most Downloaded', 'Most Popular'];

const SORT_TO_API: Record<SortOption, ApiSort> = {
  Newest: 'newest',
  Oldest: 'oldest',
  'Most Downloaded': 'most_downloaded',
  'Most Popular': 'most_popular',
};

const FILTER_TO_API: Record<MediaFilter, ApiMediaType | undefined> = {
  all: undefined,
  images: 'image',
  videos: 'video',
};

export default function SearchResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();

  const [query, setQuery] = useState(params.q ?? '');
  const [debouncedQuery, setDebouncedQuery] = useState(params.q ?? '');
  const [filter, setFilter] = useState<MediaFilter>('all');
  const [sort, setSort] = useState<SortOption>('Newest');
  const [sheetOpen, setSheetOpen] = useState(false);

  // Debounce typing so we're not firing a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const { memes, loading, error, hasMore, loadingMore, loadMore, refresh } = useMemeFeed(
    { q: debouncedQuery, mediaType: FILTER_TO_API[filter], sort: SORT_TO_API[sort], limit: 20 },
    { enabled: debouncedQuery.length > 0 }
  );

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const nearBottom = contentOffset.y + layoutMeasurement.height > contentSize.height - 300;
    if (nearBottom) loadMore();
  };

  const left = memes.filter((_, i) => i % 2 === 0);
  const right = memes.filter((_, i) => i % 2 === 1);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-3">
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Go back" className="mr-3">
          <ArrowLeft size={22} color="#F5F5F0" />
        </Pressable>
        <Text className="text-text-primary text-xl font-extrabold">Search</Text>
      </View>

      <View className="px-4 mb-3">
        <SearchBar value={query} onChangeText={setQuery} autoFocus={!params.q} placeholder="Search memes…" />
      </View>

      {debouncedQuery.length > 0 && (
        <>
          <View className="px-4 flex-row items-center justify-between mb-3">
            <Text className="text-text-secondary text-sm font-medium">
              {loading ? 'Searching…' : `${memes.length} meme${memes.length === 1 ? '' : 's'} found`}
            </Text>
            <Pressable
              onPress={() => setSheetOpen(true)}
              className="flex-row items-center bg-surface-alt rounded-lg px-3 py-1.5"
              accessibilityLabel="Change sort order"
            >
              <Text className="text-text-primary text-xs font-semibold mr-1">Sort: {sort}</Text>
              <ChevronDown size={14} color="#F5F5F0" />
            </Pressable>
          </View>

          <View className="px-4 flex-row mb-4">
            <FilterChip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
            <FilterChip label="Images" selected={filter === 'images'} onPress={() => setFilter('images')} />
            <FilterChip label="Videos" selected={filter === 'videos'} onPress={() => setFilter('videos')} />
          </View>
        </>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-4"
        contentContainerStyle={{ paddingBottom: 24 }}
        onScroll={onScroll}
        scrollEventThrottle={200}
      >
        {debouncedQuery.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Search for something funny"
            subtitle="Try a topic, tag, or creator — like “programming” or “Kenyan memes.”"
          />
        ) : loading ? (
          <SkeletonGrid count={6} />
        ) : error ? (
          <EmptyState icon={WifiOff} title="Couldn't search right now" subtitle={error} actionLabel="Try Again" onAction={refresh} />
        ) : memes.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No memes found"
            subtitle="Try another search or browse trending memes."
            actionLabel="Explore Trending"
            onAction={() => router.replace('/(tabs)/explore')}
          />
        ) : (
          <>
            <View className="flex-row" style={{ gap: 12 }}>
              <View style={{ flex: 1 }}>
                {left.map((item) => (
                  <MediaCard key={item.id} meme={toCardMeme(item)} variant="grid" onPress={() => router.push(`/meme/${item.id}`)} />
                ))}
              </View>
              <View style={{ flex: 1 }}>
                {right.map((item) => (
                  <MediaCard key={item.id} meme={toCardMeme(item)} variant="grid" onPress={() => router.push(`/meme/${item.id}`)} />
                ))}
              </View>
            </View>
            {loadingMore && (
              <View className="py-4">
                <ActivityIndicator color="#8B5CF6" />
              </View>
            )}
            {!hasMore && memes.length > 0 && (
              <Text className="text-text-muted text-xs text-center py-4">You&apos;ve reached the end.</Text>
            )}
          </>
        )}
      </ScrollView>

      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title="Sort by">
        {SORT_OPTIONS.map((opt) => (
          <SheetOption
            key={opt}
            label={opt}
            selected={sort === opt}
            onPress={() => {
              setSort(opt);
              setSheetOpen(false);
            }}
          />
        ))}
      </BottomSheet>
    </SafeAreaView>
  );
}