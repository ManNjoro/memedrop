import { useAuth } from '@clerk/expo';
import Slider from '@react-native-community/slider';
import { useEvent } from 'expo';
import * as Clipboard from 'expo-clipboard';
import { Directory, File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import {
  ArrowLeft,
  Bookmark,
  Download,
  Heart,
  Link2,
  Maximize,
  Minimize,
  MoreHorizontal,
  Pause,
  Play,
  Share2,
  Trash2,
  Volume2,
  VolumeX,
  WifiOff,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Pressable, ScrollView, Share, Text, useColorScheme, View } from 'react-native';
import { Avatar } from '../../components/Avatar';
import { BottomSheet, SheetOption } from '../../components/BottomSheet';
import { PrimaryButton } from '../../components/Buttons';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { EmptyState } from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import {
  deleteMeme,
  fetchMemeById,
  likeMeme,
  recordDownload,
  recordView,
  saveMeme,
  unlikeMeme,
  unsaveMeme,
} from '../../lib/api/memes';
import type { ApiMemeDetail } from '../../lib/api/types';
import { ApiClientError } from '../../lib/apiClient';
import { formatRelativeTime } from '../../lib/formatRelativeTime';
import ThemedSafeAreaView from '@/components/ThemedSafeAreaView';

const { width } = Dimensions.get('window');

function formatTime(sec: number) {
  if (!isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function VideoPlayerBlock({ uri, aspectRatio }: { uri: string; aspectRatio: number }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });
  const videoViewRef = useRef<VideoView>(null);

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const [muted, setMuted] = useState(false);
  const [position, setPosition] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // While the person is dragging the slider, stop the polling interval from
  // overwriting their in-progress drag position every 500ms.
  const seekingRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!seekingRef.current) setPosition(player.currentTime ?? 0);
    }, 500);
    return () => clearInterval(interval);
  }, [player]);

  const duration = player.duration ?? 0;
  const mediaHeight = width / aspectRatio;

  const onSeekStart = () => {
    seekingRef.current = true;
  };

  const onSeekComplete = (value: number) => {
    player.currentTime = value;
    setPosition(value);
    seekingRef.current = false;
  };

  const toggleFullscreen = async () => {
    try {
      if (isFullscreen) {
        await videoViewRef.current?.exitFullscreen();
      } else {
        await videoViewRef.current?.enterFullscreen();
      }
    } catch {
      // exitFullscreen() is known to throw on some Android versions
      // (expo/expo#41833) — the native fullscreen UI still has its own
      // close affordance in that case, so this is safe to swallow.
    }
  };

  return (
    <View style={{ width, height: mediaHeight }} className="bg-black">
      <VideoView
        ref={videoViewRef}
        style={{ width, height: mediaHeight }}
        player={player}
        nativeControls={false}
        contentFit="contain"
        fullscreenOptions={{
          enable: true
        }}
        onFullscreenEnter={() => setIsFullscreen(true)}
        onFullscreenExit={() => setIsFullscreen(false)}
      />

      {/* Tap-to-toggle play/pause overlay */}
      <Pressable
        className="absolute inset-0 items-center justify-center"
        onPress={() => (isPlaying ? player.pause() : player.play())}
        accessibilityLabel={isPlaying ? 'Pause video' : 'Play video'}
      >
        {!isPlaying && (
          <View className="w-16 h-16 rounded-full bg-black/50 items-center justify-center">
            <Play size={28} color="#F5F5F0" fill="#F5F5F0" />
          </View>
        )}
      </Pressable>

      {/* Bottom controls bar */}
      <View className="absolute bottom-0 left-0 right-0 px-3 pb-1 pt-6 bg-black/40">
        <Slider
          style={{ width: '100%', height: 28 }}
          minimumValue={0}
          maximumValue={duration > 0 ? duration : 1}
          value={position}
          minimumTrackTintColor="#8B5CF6"
          maximumTrackTintColor="rgba(255,255,255,0.25)"
          thumbTintColor="#8B5CF6"
          onSlidingStart={onSeekStart}
          onValueChange={setPosition}
          onSlidingComplete={onSeekComplete}
          accessibilityLabel="Seek video position"
        />
        <View className="flex-row items-center justify-between -mt-1 pb-2">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => (isPlaying ? player.pause() : player.play())}
              hitSlop={8}
              accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
              className="mr-4"
            >
              {isPlaying ? (
                <Pause size={18} color="#F5F5F0" fill="#F5F5F0" />
              ) : (
                <Play size={18} color="#F5F5F0" fill="#F5F5F0" />
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                player.muted = !muted;
                setMuted(!muted);
              }}
              hitSlop={8}
              accessibilityLabel={muted ? 'Unmute' : 'Mute'}
              className="mr-3"
            >
              {muted ? <VolumeX size={18} color="#F5F5F0" /> : <Volume2 size={18} color="#F5F5F0" />}
            </Pressable>
            <Text className="text-text-primary-light dark:text-text-primary text-xs font-medium">
              {formatTime(position)} / {formatTime(duration)}
            </Text>
          </View>
          <Pressable
            onPress={toggleFullscreen}
            hitSlop={8}
            accessibilityLabel={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize size={18} color="#F5F5F0" />
            ) : (
              <Maximize size={18} color="#F5F5F0" />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function MemeDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId, isSignedIn, getToken } = useAuth();
  const { showToast } = useToast();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const iconColor = isDark ? "#F5F5F0" : "#121214";

  const [meme, setMeme] = useState<ApiMemeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Kept separate from `meme` so liking/saving can update instantly
  // (optimistic) without waiting on or re-triggering a full refetch.
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [likeInFlight, setLikeInFlight] = useState(false);
  const [saveInFlight, setSaveInFlight] = useState(false);

  // Guards against double-firing the view count in React 18 Strict Mode's
  // dev double-invoke, and against re-recording a view on every refetch.
  const viewRecordedRef = useRef(false);

  const authRef = useRef({ isSignedIn, getToken });
  useEffect(() => {
    authRef.current = { isSignedIn, getToken };
  }, [isSignedIn, getToken]);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { isSignedIn: signedIn, getToken: getAuthToken } = authRef.current;
      const token = signedIn ? await getAuthToken() : null;
      const result = await fetchMemeById(id, token);
      setMeme(result);
      setIsLiked(result.isLiked);
      setLikesCount(result.likesCount);
      setIsSaved(result.isSaved);

      if (!viewRecordedRef.current) {
        viewRecordedRef.current = true;
        recordView(id).catch(() => {}); // best-effort — see recordView's own comment on why simplicity here is fine
      }
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Couldn\u2019t load this meme.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const aspectRatio = meme?.width && meme?.height ? meme.width / meme.height : 0.8;
  const mediaHeight = width / aspectRatio;
  const shareUrl = meme ? `${meme.mediaUrl}` : '';
  const isOwner = !!meme && !!userId && meme.uploader.id === userId;

  const onShare = async () => {
    try {
      await Share.share({ message: `Check this out on MemeDrop: ${shareUrl}` });
    } catch {}
  };

  const onCopyLink = async () => {
    await Clipboard.setStringAsync(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const onDownload = async () => {
    if (!meme || downloading) return;
    setDownloading(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        showToast({ message: 'Allow photo library access to save downloads.', variant: 'error' });
        return;
      }

      const downloadsDir = new Directory(Paths.cache, 'memedrop-downloads');
      if (!downloadsDir.exists) downloadsDir.create();

      const output = await File.downloadFileAsync(meme.mediaUrl, downloadsDir);
      await MediaLibrary.saveToLibraryAsync(output.uri);

      recordDownload(meme.id).catch(() => {});

      showToast({ message: 'Saved to your gallery', variant: 'success' });
    } catch {
      showToast({ message: 'Couldn\u2019t download this meme. Check your connection and try again.', variant: 'error' });
    } finally {
      setDownloading(false);
    }
  };

  const onToggleLike = async () => {
    if (!meme || likeInFlight) return;
    if (!isSignedIn) {
      showToast({ message: 'Sign in to like memes.', variant: 'error' });
      return;
    }
    // Optimistic update — flip immediately, roll back only if the request fails.
    const wasLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!wasLiked);
    setLikesCount(wasLiked ? Math.max(prevCount - 1, 0) : prevCount + 1);
    setLikeInFlight(true);
    try {
      const token = await getToken();
      const result = wasLiked ? await unlikeMeme(meme.id, token) : await likeMeme(meme.id, token);
      setIsLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch {
      setIsLiked(wasLiked);
      setLikesCount(prevCount);
      showToast({ message: 'Couldn\u2019t update that. Try again.', variant: 'error' });
    } finally {
      setLikeInFlight(false);
    }
  };

  const onToggleSave = async () => {
    if (!meme || saveInFlight) return;
    if (!isSignedIn) {
      showToast({ message: 'Sign in to save memes.', variant: 'error' });
      return;
    }
    const wasSaved = isSaved;
    setIsSaved(!wasSaved);
    setSaveInFlight(true);
    try {
      const token = await getToken();
      const result = wasSaved ? await unsaveMeme(meme.id, token) : await saveMeme(meme.id, token);
      setIsSaved(result.saved);
      if (result.saved) showToast({ message: 'Saved', variant: 'success' });
    } catch {
      setIsSaved(wasSaved);
      showToast({ message: 'Couldn\u2019t update that. Try again.', variant: 'error' });
    } finally {
      setSaveInFlight(false);
    }
  };

  const onConfirmDelete = async () => {
    if (!meme) return;
    setDeleting(true);
    try {
      const token = await getToken();
      await deleteMeme(meme.id, token);
      setConfirmDeleteOpen(false);
      showToast({ message: 'Meme deleted', variant: 'success' });
      router.back();
    } catch (e) {
      showToast({
        message: e instanceof ApiClientError ? e.message : 'Couldn\u2019t delete this meme. Try again.',
        variant: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Unified to ThemedSafeAreaView across all three states (loading, error,
  // success) — previously the loading branch used a different SafeAreaView
  // wrapper with its own manually-applied bg-bg-light dark:bg-bg classes,
  // which could show a visible flash of mismatched background/padding right
  // at the loading → loaded transition, on top of the refetch-loop flicker.
  if (loading) {
    return (
      <ThemedSafeAreaView>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#8B5CF6" />
        </View>
      </ThemedSafeAreaView>
    );
  }

  if (error || !meme) {
    return (
      <ThemedSafeAreaView>
        <View className="flex-row items-center px-4 pt-2 pb-3">
          <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Go back">
            <ArrowLeft size={22} color={iconColor} />
          </Pressable>
        </View>
        <EmptyState
          icon={WifiOff}
          title="Couldn't load this meme"
          subtitle={error ?? 'It may have been removed.'}
          actionLabel="Try Again"
          onAction={load}
        />
      </ThemedSafeAreaView>
    );
  }

  return (
    <ThemedSafeAreaView>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName='pb-12'>
        {/* Media */}
        <View>
          {meme.mediaType === 'video' ? (
            <VideoPlayerBlock uri={meme.mediaUrl} aspectRatio={aspectRatio} />
          ) : (
            <Image
              source={{ uri: meme.mediaUrl }}
              style={{ width, height: mediaHeight }}
              resizeMode="cover"
            />
          )}

          {/* Header controls floating over media */}
          <View className="absolute top-3 left-3 right-3 flex-row items-center justify-between">
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              accessibilityLabel="Go back"
              className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
            >
              <ArrowLeft size={20} color={iconColor} />
            </Pressable>
            <Pressable
              onPress={() => setMoreOpen(true)}
              hitSlop={8}
              accessibilityLabel="More options"
              className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
            >
              <MoreHorizontal size={20} color={iconColor} />
            </Pressable>
          </View>
        </View>

        {/* Info */}
        <View className="px-4 pt-5">
          <Text className="text-text-primary-light dark:text-text-primary text-xl font-bold mb-1">{meme.title}</Text>
          {!!meme.description && (
            <Text className="text-text-secondary-light dark:text-text-secondary text-sm leading-5 mb-3">{meme.description}</Text>
          )}
          <Pressable
            onPress={() => router.push(`/creator/${meme.uploader.username}`)}
            className="flex-row items-center mb-2 mt-2"
            accessibilityLabel={`View @${meme.uploader.username}'s profile`}
          >
            <Avatar uri={meme.uploader.avatarUrl} name={meme.uploader.username} size="sm" />
            <View className="ml-2.5">
              <Text className="text-text-primary-light dark:text-text-primary text-sm font-semibold">Uploaded by @{meme.uploader.username}</Text>
              <Text className="text-text-muted text-xs mt-0.5">{formatRelativeTime(meme.createdAt)}</Text>
            </View>
          </Pressable>

          <Text className="text-text-muted text-xs mb-5">
            {likesCount} {likesCount === 1 ? 'like' : 'likes'} · {meme.viewsCount}{' '}
            {meme.viewsCount === 1 ? 'view' : 'views'}
          </Text>

          {/* Actions */}
          <PrimaryButton
            label={downloading ? 'Saving…' : 'Download'}
            icon={<Download size={18} color={iconColor} />}
            onPress={onDownload}
            loading={downloading}
            className="mb-3"
          />
          <View className="flex-row" style={{ gap: 10 }}>
            <Pressable
              onPress={onToggleLike}
              disabled={likeInFlight}
              className={`flex-1 flex-row items-center justify-center py-3.5 rounded-lg border ${
                isLiked ? 'bg-danger/10 border-danger' : 'bg-surface-alt-light dark:bg-surface-alt border-border-light dark:border-border'
              }`}
              accessibilityLabel={isLiked ? 'Unlike meme' : 'Like meme'}
              accessibilityState={{ selected: isLiked }}
            >
              <Heart size={16} color={isLiked ? '#F5484B' : '#F5F5F0'} fill={isLiked ? '#F5484B' : 'transparent'} />
              <Text className={`text-sm font-semibold ml-2 ${isLiked ? 'text-danger' : 'text-text-primary-light dark:text-text-primary'}`}>
                Like
              </Text>
            </Pressable>
            <Pressable
              onPress={onToggleSave}
              disabled={saveInFlight}
              className={`flex-1 flex-row items-center justify-center py-3.5 rounded-lg border ${
                isSaved ? 'bg-primary/10 border-primary' : 'bg-surface-alt-light dark:bg-surface-alt border-border-light dark:border-border'
              }`}
              accessibilityLabel={isSaved ? 'Remove from saved' : 'Save meme'}
              accessibilityState={{ selected: isSaved }}
            >
              <Bookmark size={16} color={isSaved ? '#8B5CF6' : '#F5F5F0'} fill={isSaved ? '#8B5CF6' : 'transparent'} />
              <Text className={`text-sm font-semibold ml-2 ${isSaved ? 'text-primary' : 'text-text-primary-light dark:text-text-primary'}`}>
                Save
              </Text>
            </Pressable>
          </View>
          <View className="flex-row mt-2.5" style={{ gap: 10 }}>
            <Pressable
              onPress={onShare}
              className="flex-1 flex-row items-center justify-center py-3.5 rounded-lg bg-surface-alt-light dark:bg-surface-alt border border-border-light dark:border-border"
              accessibilityLabel="Share meme"
            >
              <Share2 size={16} color={iconColor} />
              <Text className="text-text-primary-light dark:text-text-primary text-sm font-semibold ml-2">Share</Text>
            </Pressable>
            <Pressable
              onPress={onCopyLink}
              className="flex-1 flex-row items-center justify-center py-3.5 rounded-lg bg-surface-alt-light dark:bg-surface-alt border border-border-light dark:border-border"
              accessibilityLabel="Copy link"
            >
              <Link2 size={16} color={iconColor} />
              <Text className="text-text-primary-light dark:text-text-primary text-sm font-semibold ml-2">
                {copied ? 'Copied!' : 'Copy Link'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <BottomSheet visible={moreOpen} onClose={() => setMoreOpen(false)}>
        {isOwner && (
          <SheetOption
            label="Delete meme"
            destructive
            icon={<Trash2 size={17} color="#F5484B" />}
            onPress={() => {
              setMoreOpen(false);
              setConfirmDeleteOpen(true);
            }}
          />
        )}
        <SheetOption
          label="Report content"
          onPress={() => {
            setMoreOpen(false);
            // TODO: route to report flow
          }}
        />
        <View className="pt-1">
          <Pressable onPress={() => setMoreOpen(false)} className="py-4 items-center">
            <Text className="text-text-secondary-light dark:text-text-secondary text-base font-semibold">Cancel</Text>
          </Pressable>
        </View>
      </BottomSheet>

      <ConfirmationModal
        visible={confirmDeleteOpen}
        title="Delete this meme?"
        message="This can't be undone — it'll be removed for everyone."
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        cancelLabel="Cancel"
        destructive
        onConfirm={onConfirmDelete}
        onCancel={() => !deleting && setConfirmDeleteOpen(false)}
      />
    </ThemedSafeAreaView>
  );
}