import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown, SearchX } from 'lucide-react-native';
import { SearchBar } from '../components/SearchBar';
import { FilterChip } from '../components/Chips';
import { MediaCard, Meme } from '../components/MediaCard';
import { SkeletonGrid } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { BottomSheet, SheetOption } from '../components/BottomSheet';
import { SafeAreaView } from '@/components/CustomSafeAreaView';

type MediaFilter = 'all' | 'images' | 'videos';
type SortOption = 'Newest' | 'Oldest' | 'Most Downloaded' | 'Most Popular';

const SORT_OPTIONS: SortOption[] = ['Newest', 'Oldest', 'Most Downloaded', 'Most Popular'];

// Realistic placeholder results for query "programming".
const MOCK_RESULTS: Meme[] = [
  {
    id: 's1',
    title: 'Me debugging at 2am',
    mediaUrl: 'https://picsum.photos/seed/debug-2am/700/900',
    mediaType: 'image',
    creatorName: 'otieno.dev',
    creatorAvatar: null,
    uploadedAt: '4h ago',
    aspectRatio: 0.78,
  },
  {
    id: 's2',
    title: 'git push --force and pray',
    mediaUrl: 'https://picsum.photos/seed/git-force/700/700',
    mediaType: 'video',
    durationSec: 17,
    creatorName: 'kevin_devops',
    creatorAvatar: null,
    uploadedAt: '7h ago',
    aspectRatio: 1,
  },
  {
    id: 's3',
    title: 'Stack Overflow answer from 2011 saves the day',
    mediaUrl: 'https://picsum.photos/seed/stackoverflow/700/950',
    mediaType: 'image',
    creatorName: 'nyambura_codes',
    creatorAvatar: null,
    uploadedAt: '9h ago',
    aspectRatio: 0.72,
  },
  {
    id: 's4',
    title: 'When the code works but you don\u2019t know why',
    mediaUrl: 'https://picsum.photos/seed/works-why/700/860',
    mediaType: 'image',
    creatorName: 'devwithamani',
    creatorAvatar: null,
    uploadedAt: '12h ago',
    aspectRatio: 0.86,
  },
  {
    id: 's5',
    title: 'Explaining my code to the rubber duck',
    mediaUrl: 'https://picsum.photos/seed/rubber-duck/700/1000',
    mediaType: 'video',
    durationSec: 25,
    creatorName: 'brian_ke',
    creatorAvatar: null,
    uploadedAt: '1d ago',
    aspectRatio: 0.7,
  },
];

export default function SearchResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();

  const [query, setQuery] = useState(params.q ?? '');
  const [filter, setFilter] = useState<MediaFilter>('all');
  const [sort, setSort] = useState<SortOption>('Newest');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, [query, filter, sort]);

  const results = useMemo(() => {
    if (!query) return [];
    let data = MOCK_RESULTS;
    if (filter === 'images') data = data.filter((m) => m.mediaType === 'image');
    if (filter === 'videos') data = data.filter((m) => m.mediaType === 'video');
    return data;
  }, [query, filter]);

  const left = results.filter((_, i) => i % 2 === 0);
  const right = results.filter((_, i) => i % 2 === 1);

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

      {query.length > 0 && (
        <>
          <View className="px-4 flex-row items-center justify-between mb-3">
            <Text className="text-text-secondary text-sm font-medium">
              {loading ? 'Searching…' : `${results.length} memes found`}
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

      <ScrollView showsVerticalScrollIndicator={false} className="px-4" contentContainerStyle={{ paddingBottom: 24 }}>
        {query.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Search for something funny"
            subtitle="Try a topic, tag, or creator — like “programming” or “Kenyan memes.”"
          />
        ) : loading ? (
          <SkeletonGrid count={6} />
        ) : results.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No memes found"
            subtitle="Try another search or browse trending memes."
            actionLabel="Explore Trending"
            onAction={() => router.replace('/(tabs)/explore')}
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
        {/* In production: trigger onEndReached / fetchNextPage here for infinite scroll */}
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