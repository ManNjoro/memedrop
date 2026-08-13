// app/(tabs)/explore.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from '../../components/SearchBar';
import { CategoryChip } from '../../components/Chips';
import { MediaCard, Meme } from '../../components/MediaCard';

const EXPLORE_CATEGORIES = [
  'Programming',
  'School',
  'Work',
  'Relationships',
  'Gaming',
  'Animals',
  'Football',
  'Movies',
  'African Memes',
  'Kenyan Memes',
  'Random',
];

// Realistic placeholder trending grid — replace mediaUrl with Cloudinary URLs later.
const TRENDING: Meme[] = [
  {
    id: 't1',
    title: 'POV: the WiFi drops during a demo',
    mediaUrl: 'https://picsum.photos/seed/wifi-demo/700/900',
    mediaType: 'image',
    creatorName: 'nyambura_codes',
    creatorAvatar: null,
    uploadedAt: '3h ago',
    aspectRatio: 0.78,
  },
  {
    id: 't2',
    title: 'Trying to explain recursion',
    mediaUrl: 'https://picsum.photos/seed/recursion/700/700',
    mediaType: 'video',
    durationSec: 21,
    creatorName: 'otieno.dev',
    creatorAvatar: null,
    uploadedAt: '6h ago',
    aspectRatio: 1,
  },
  {
    id: 't3',
    title: 'Football WhatsApp group after a loss',
    mediaUrl: 'https://picsum.photos/seed/wa-group/700/1000',
    mediaType: 'image',
    creatorName: 'mwas_soko',
    creatorAvatar: null,
    uploadedAt: '8h ago',
    aspectRatio: 0.7,
  },
  {
    id: 't4',
    title: 'My cat judging my life choices',
    mediaUrl: 'https://picsum.photos/seed/cat-judge/700/850',
    mediaType: 'image',
    creatorName: 'faithkim',
    creatorAvatar: null,
    uploadedAt: '10h ago',
    aspectRatio: 0.82,
  },
  {
    id: 't5',
    title: 'Lecturer: "This won\'t be on the exam"',
    mediaUrl: 'https://picsum.photos/seed/exam-lecturer/700/950',
    mediaType: 'video',
    durationSec: 9,
    creatorName: 'brian_ke',
    creatorAvatar: null,
    uploadedAt: '13h ago',
    aspectRatio: 0.74,
  },
  {
    id: 't6',
    title: 'Marvel fans after every trailer',
    mediaUrl: 'https://picsum.photos/seed/marvel-trailer/700/800',
    mediaType: 'image',
    creatorName: 'devwithamani',
    creatorAvatar: null,
    uploadedAt: '1d ago',
    aspectRatio: 0.88,
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const goToSearch = (q?: string) => {
    router.push({ pathname: '/search', params: { q: q ?? query } });
  };

  // split into two columns for a simple masonry-style layout
  const left = TRENDING.filter((_, i) => i % 2 === 0);
  const right = TRENDING.filter((_, i) => i % 2 === 1);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        <Text className="text-text-primary text-2xl font-extrabold pt-2 mb-4">Explore</Text>

        <Pressable onPress={() => goToSearch()} accessibilityLabel="Go to search">
          <View pointerEvents="none">
            <SearchBar value={query} onChangeText={setQuery} onSubmit={() => goToSearch()} />
          </View>
        </Pressable>

        <Text className="text-text-primary text-lg font-bold mt-6 mb-3">Categories</Text>
        <View className="flex-row flex-wrap mb-2">
          {EXPLORE_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              selected={activeCategory === cat}
              onPress={() => {
                setActiveCategory(cat);
                goToSearch(cat);
              }}
            />
          ))}
        </View>

        <Text className="text-text-primary text-lg font-bold mt-6 mb-3">Trending now</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}