// app/(tabs)/index.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { CategoryChip } from '../../components/Chips';
import { MediaCard, Meme } from '../../components/MediaCard';
import { Avatar } from '../../components/Avatar';

const CATEGORIES = ['Trending', 'Latest', 'Videos', 'Images', 'Popular'];

// Realistic placeholder feed — swap mediaUrl with real Cloudinary URLs later.
const MOCK_FEED: Meme[] = [
  {
    id: '1',
    title: 'When you push directly to production',
    mediaUrl: 'https://picsum.photos/seed/prod-push/800/1000',
    mediaType: 'image',
    creatorName: 'kevin_devops',
    creatorAvatar: null,
    uploadedAt: '2h ago',
    aspectRatio: 0.8,
  },
  {
    id: '2',
    title: 'Monday morning stand-up energy',
    mediaUrl: 'https://picsum.photos/seed/standup/800/900',
    mediaType: 'video',
    durationSec: 14,
    creatorName: 'wanjiru.exe',
    creatorAvatar: null,
    uploadedAt: '5h ago',
    aspectRatio: 0.9,
  },
  {
    id: '3',
    title: 'That one group project member',
    mediaUrl: 'https://picsum.photos/seed/group-project/800/800',
    mediaType: 'image',
    creatorName: 'brian_ke',
    creatorAvatar: null,
    uploadedAt: '1d ago',
    aspectRatio: 1,
  },
  {
    id: '4',
    title: 'CSS centering a div, explained',
    mediaUrl: 'https://picsum.photos/seed/css-center/800/1100',
    mediaType: 'video',
    durationSec: 42,
    creatorName: 'devwithamani',
    creatorAvatar: null,
    uploadedAt: '1d ago',
    aspectRatio: 0.75,
  },
  {
    id: '5',
    title: 'Harambee Stars fans rn',
    mediaUrl: 'https://picsum.photos/seed/harambee/800/950',
    mediaType: 'image',
    creatorName: 'mwas_soko',
    creatorAvatar: null,
    uploadedAt: '2d ago',
    aspectRatio: 0.85,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('Trending');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: refetch feed from API
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />}
      >
        {/* Top bar */}
        <View className="flex-row items-center justify-between px-4 pt-2 pb-4">
          <Text className="text-text-primary text-2xl font-extrabold">
            Meme<Text className="text-primary">Drop</Text>
          </Text>
          <View className="flex-row items-center">
            <Pressable
            //   onPress={() => router.push('/search')}
              onPress={() => router.push('/(tabs)')}
              hitSlop={8}
              accessibilityLabel="Search"
              className="w-10 h-10 rounded-full bg-surface-alt items-center justify-center mr-3"
            >
              <Search size={20} color="#F5F5F0" />
            </Pressable>
            <Pressable
            //  onPress={() => router.push('/profile')} 
             onPress={() => router.push('/(tabs)')} 
             accessibilityLabel="Your profile">
              <Avatar uri={null} name="You" size="sm" />
            </Pressable>
          </View>
        </View>

        {/* Hero greeting */}
        <View className="px-4 mb-5">
          <Text className="text-text-primary text-[26px] font-extrabold leading-8">
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

        {/* Featured card */}
        <Pressable
        //   onPress={() => router.push(`/meme/${MOCK_FEED[0].id}`)}
          onPress={() => router.push(`/(tabs)`)}
          className="mx-4 mb-5 rounded-lg overflow-hidden bg-surface"
        >
          <Image
            source={{ uri: MOCK_FEED[0].mediaUrl }}
            style={{ width: '100%', height: 260 }}
            resizeMode="cover"
          />
          <View className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-black/40">
            <Text className="text-text-primary text-xs font-bold uppercase tracking-wide mb-1">
              🔥 Featured
            </Text>
            <Text className="text-text-primary text-lg font-bold">{MOCK_FEED[0].title}</Text>
          </View>
        </Pressable>

        {/* Feed */}
        <View className="px-4 pb-6">
          {MOCK_FEED.slice(1).map((meme) => (
            <MediaCard
              key={meme.id}
              meme={meme}
              variant="feed"
            //   onPress={() => router.push(`/meme/${meme.id}`)}
              onPress={() => router.push(`/(tabs)`)}
              onDownload={() => {}}
              onShare={() => {}}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}