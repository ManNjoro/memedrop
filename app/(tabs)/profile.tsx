import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from '@/components/CustomSafeAreaView';
import { useUser } from '@clerk/expo';
import { Settings, Inbox, LogIn, WifiOff } from 'lucide-react-native';
import { Avatar } from '../../components/Avatar';
import { MediaCard } from '../../components/MediaCard';
import { EmptyState } from '../../components/EmptyState';
import { PrimaryButton } from '../../components/Buttons';
import { SkeletonGrid } from '../../components/SkeletonLoader';
import { useUserWithMemes } from '../../lib/hooks/useUserWithMemes';
import { useSavedMemes } from '../../lib/hooks/useSavedMemes';
import { toCardMemeFromUserItem, toCardMeme } from '../../lib/mappers';
import ThemedSafeAreaView from '@/components/ThemedSafeAreaView';

type ProfileTab = 'uploads' | 'saved';

function formatMemberSince(date: Date | null | undefined) {
  if (!date) return '';
  return `Member since ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded, user } = useUser();
  const [tab, setTab] = useState<ProfileTab>('uploads');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#F5F5F0' : '#121214';

  const { profile, memes, loading, error, refresh } = useUserWithMemes(isSignedIn ? user?.username ?? undefined : undefined);
  const saved = useSavedMemes();

  // Expo Router keeps tab screens mounted rather than remounting them on
  // every visit, so a plain useEffect([]) only ever fires once — liking a
  // meme on the details screen, then backing out to this tab, would never
  // trigger a refetch and the stats (likes/downloads on your own uploads)
  // would sit stale. useFocusEffect fires every time this tab actually
  // regains focus, which is the fix.
  useFocusEffect(
    useCallback(() => {
      if (!isSignedIn) return;
      refresh();
      // Only refresh Saved if it's the currently visible tab and has
      // already been loaded once — no reason to eagerly fetch it here if
      // the person has never opened that tab.
      if (tab === 'saved' && saved.loaded) {
        saved.refresh();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSignedIn, tab])
  );

  // Fetch saved memes lazily the first time the person actually opens that
  // tab, rather than on every profile visit whether they check it or not.
  useEffect(() => {
    if (tab === 'saved' && !saved.loaded && !saved.loading) {
      saved.load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, saved.loaded, saved.loading]);

  const memberSince = useMemo(
    () => formatMemberSince(user?.createdAt ? new Date(user.createdAt) : null),
    [user?.createdAt]
  );

  const totalDownloads = useMemo(() => memes.reduce((sum, m) => sum + m.downloadsCount, 0), [memes]);
  const totalLikes = useMemo(() => memes.reduce((sum, m) => sum + m.likesCount, 0), [memes]);

  // Loading Clerk state — avoid flashing the signed-out view.
  if (!isLoaded) {
    return <SafeAreaView className="flex-1 bg-bg-light dark:bg-bg" />;
  }

  if (!isSignedIn) {
    return (
      <ThemedSafeAreaView>
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-surface-alt-light dark:bg-surface-alt items-center justify-center mb-5">
            <LogIn size={30} color="#8B5CF6" strokeWidth={1.75} />
          </View>
          <Text className="text-text-primary-light dark:text-text-primary text-lg font-bold text-center mb-1.5">
            Sign in to see your profile
          </Text>
          <Text className="text-text-secondary-light dark:text-text-secondary text-sm text-center leading-5 mb-6">
            Track your uploads, saved memes, and stats once you&apos;re signed in.
          </Text>
          <PrimaryButton
            label="Sign In"
            onPress={() => router.push('/(auth)/sign-in')}
            className="w-full max-w-60 mb-3"
          />
          <Pressable onPress={() => router.push('/(auth)/sign-up')}>
            <Text className="text-primary text-sm font-semibold">Create an account</Text>
          </Pressable>
        </View>
      </ThemedSafeAreaView>
    );
  }

  // "Saved" has a real backing endpoint (GET /api/saved) — fetched lazily
  // above when this tab is opened, and refreshed on focus if already loaded.
  const activeLoading = tab === 'uploads' ? loading : saved.loading;
  const activeError = tab === 'uploads' ? error : saved.error;
  const activeRefresh = tab === 'uploads' ? refresh : saved.refresh;
  const activeCount = tab === 'uploads' ? memes.length : saved.memes.length;

  return (
    <ThemedSafeAreaView>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between px-4 pt-2 pb-1">
          <Text className="text-text-primary-light dark:text-text-primary text-xl font-extrabold">Profile</Text>
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={8}
            accessibilityLabel="Settings"
            className="w-10 h-10 rounded-full bg-surface-alt-light dark:bg-surface-alt items-center justify-center"
          >
            <Settings size={19} color={iconColor} />
          </Pressable>
        </View>

        <View className="items-center px-6 pt-4 pb-6">
          <Avatar uri={user?.imageUrl} name={user?.username ?? 'you'} size="lg" />
          <Text className="text-text-primary-light dark:text-text-primary text-lg font-bold mt-3">
            @{user?.username ?? 'you'}
          </Text>
          <Text className="text-text-muted text-xs mt-1">{memberSince}</Text>

          <View className="flex-row mt-6" style={{ gap: 32 }}>
            <View className="items-center">
              <Text className="text-text-primary-light dark:text-text-primary text-lg font-extrabold">
                {profile?.memeCount ?? memes.length}
              </Text>
              <Text className="text-text-muted text-xs mt-0.5">Uploads</Text>
            </View>
            <View className="items-center">
              <Text className="text-text-primary-light dark:text-text-primary text-lg font-extrabold">
                {totalDownloads}
              </Text>
              <Text className="text-text-muted text-xs mt-0.5">Downloads</Text>
            </View>
            <View className="items-center">
              <Text className="text-text-primary-light dark:text-text-primary text-lg font-extrabold">
                {totalLikes}
              </Text>
              <Text className="text-text-muted text-xs mt-0.5">Likes</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row px-4 border-b border-border-light dark:border-border mb-4">
          <Pressable
            onPress={() => setTab('uploads')}
            className={`flex-1 items-center pb-3 border-b-2 ${tab === 'uploads' ? 'border-primary' : 'border-transparent'}`}
          >
            <Text
              className={`text-sm font-bold ${
                tab === 'uploads' ? 'text-text-primary-light dark:text-text-primary' : 'text-text-muted'
              }`}
            >
              My Memes
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('saved')}
            className={`flex-1 items-center pb-3 border-b-2 ${tab === 'saved' ? 'border-primary' : 'border-transparent'}`}
          >
            <Text
              className={`text-sm font-bold ${
                tab === 'saved' ? 'text-text-primary-light dark:text-text-primary' : 'text-text-muted'
              }`}
            >
              Saved
            </Text>
          </Pressable>
        </View>

        <View className="px-4 pb-8">
          {activeLoading ? (
            <SkeletonGrid count={4} />
          ) : activeError ? (
            <EmptyState
              icon={WifiOff}
              title={tab === 'uploads' ? "Couldn't load your memes" : "Couldn't load your saved memes"}
              subtitle={activeError}
              actionLabel="Try Again"
              onAction={activeRefresh}
            />
          ) : activeCount === 0 ? (
            <EmptyState
              icon={Inbox}
              title={tab === 'uploads' ? "You haven't dropped anything yet." : 'Nothing saved yet.'}
              subtitle={
                tab === 'uploads'
                  ? 'Your uploads will show up here once you drop your first meme.'
                  : 'Tap the bookmark icon on a meme to save it here.'
              }
              actionLabel={tab === 'uploads' ? 'Upload Your First Meme' : undefined}
              onAction={tab === 'uploads' ? () => router.push('/(tabs)/upload') : undefined}
            />
          ) : tab === 'uploads' ? (
            <View className="flex-row" style={{ gap: 12 }}>
              <View style={{ flex: 1 }}>
                {memes.filter((_, i) => i % 2 === 0).map((item) => (
                  <MediaCard
                    key={item.id}
                    meme={toCardMemeFromUserItem(item, user?.username ?? 'you', user?.imageUrl)}
                    variant="grid"
                    onPress={() => router.push(`/meme/${item.id}`)}
                  />
                ))}
              </View>
              <View style={{ flex: 1 }}>
                {memes.filter((_, i) => i % 2 === 1).map((item) => (
                  <MediaCard
                    key={item.id}
                    meme={toCardMemeFromUserItem(item, user?.username ?? 'you', user?.imageUrl)}
                    variant="grid"
                    onPress={() => router.push(`/meme/${item.id}`)}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View className="flex-row" style={{ gap: 12 }}>
              <View style={{ flex: 1 }}>
                {saved.memes.filter((_, i) => i % 2 === 0).map((item) => (
                  <MediaCard
                    key={item.id}
                    meme={toCardMeme(item)}
                    variant="grid"
                    onPress={() => router.push(`/meme/${item.id}`)}
                  />
                ))}
              </View>
              <View style={{ flex: 1 }}>
                {saved.memes.filter((_, i) => i % 2 === 1).map((item) => (
                  <MediaCard
                    key={item.id}
                    meme={toCardMeme(item)}
                    variant="grid"
                    onPress={() => router.push(`/meme/${item.id}`)}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedSafeAreaView>
  );
}