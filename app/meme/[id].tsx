import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, Dimensions, ActivityIndicator, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import * as Clipboard from 'expo-clipboard';
import { File, Directory, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import {
  ArrowLeft,
  MoreHorizontal,
  Download,
  Share2,
  Link2,
  Play,
  Pause,
  Maximize,
  Volume2,
  VolumeX,
  WifiOff,
} from 'lucide-react-native';
import { Avatar } from '../../components/Avatar';
import { PrimaryButton } from '../../components/Buttons';
import { BottomSheet, SheetOption } from '../../components/BottomSheet';
import { EmptyState } from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import { fetchMemeById, recordDownload } from '../../lib/api/memes';
import { formatRelativeTime } from '../../lib/formatRelativeTime';
import type { ApiMemeDetail } from '../../lib/api/types';
import { ApiClientError } from '../../lib/apiClient';

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

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const [muted, setMuted] = useState(false);
  const [position, setPosition] = useState(0);

  // expo-video exposes currentTime/duration on the player; poll lightly for a simple progress bar.
  useEffect(() => {
    const interval = setInterval(() => setPosition(player.currentTime ?? 0), 500);
    return () => clearInterval(interval);
  }, [player]);

  const duration = player.duration ?? 0;
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;
  const mediaHeight = width / aspectRatio;

  return (
    <View style={{ width, height: mediaHeight }} className="bg-black">
      <VideoView
        style={{ width, height: mediaHeight }}
        player={player}
        nativeControls={false}
        contentFit="contain"
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
      <View className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6 bg-black/40">
        <View className="h-1 rounded-full bg-white/25 mb-2 overflow-hidden">
          <View style={{ width: `${progress * 100}%` }} className="h-1 bg-primary rounded-full" />
        </View>
        <View className="flex-row items-center justify-between">
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
            <Text className="text-text-primary text-xs font-medium">
              {formatTime(position)} / {formatTime(duration)}
            </Text>
          </View>
          <Pressable onPress={() => player.play()} hitSlop={8} accessibilityLabel="Fullscreen">
            <Maximize size={18} color="#F5F5F0" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function MemeDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showToast } = useToast();

  const [meme, setMeme] = useState<ApiMemeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchMemeById(id);
      setMeme(result);
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
  const shareUrl = meme ? `https://memedrop.app/meme/${meme.id}` : '';

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

      // New expo-file-system class-based API (SDK 54+) — the old
      // FileSystem.cacheDirectory / downloadAsync statics are deprecated
      // and throw at runtime; File.downloadFileAsync + Directory replace them.
      const downloadsDir = new Directory(Paths.cache, 'memedrop-downloads');
      if (!downloadsDir.exists) downloadsDir.create();

      const output = await File.downloadFileAsync(meme.mediaUrl, downloadsDir);
      await MediaLibrary.saveToLibraryAsync(output.uri);

      // Fire-and-forget — a failed counter bump shouldn't block "your download succeeded".
      recordDownload(meme.id).catch(() => {});

      showToast({ message: 'Saved to your gallery', variant: 'success' });
    } catch {
      showToast({ message: 'Couldn\u2019t download this meme. Check your connection and try again.', variant: 'error' });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color="#8B5CF6" />
      </SafeAreaView>
    );
  }

  if (error || !meme) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-bg">
        <View className="flex-row items-center px-4 pt-2 pb-3">
          <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Go back">
            <ArrowLeft size={22} color="#F5F5F0" />
          </Pressable>
        </View>
        <EmptyState
          icon={WifiOff}
          title="Couldn't load this meme"
          subtitle={error ?? 'It may have been removed.'}
          actionLabel="Try Again"
          onAction={load}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <ScrollView showsVerticalScrollIndicator={false}>
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
              <ArrowLeft size={20} color="#F5F5F0" />
            </Pressable>
            <Pressable
              onPress={() => setMoreOpen(true)}
              hitSlop={8}
              accessibilityLabel="More options"
              className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
            >
              <MoreHorizontal size={20} color="#F5F5F0" />
            </Pressable>
          </View>
        </View>

        {/* Info */}
        <View className="px-4 pt-5">
          <Text className="text-text-primary text-xl font-bold mb-1">{meme.title}</Text>
          {!!meme.description && (
            <Text className="text-text-secondary text-sm leading-5 mb-3">{meme.description}</Text>
          )}
          <Pressable
            onPress={() => router.push(`/creator/${meme.uploader.username}`)}
            className="flex-row items-center mb-5 mt-2"
            accessibilityLabel={`View @${meme.uploader.username}'s profile`}
          >
            <Avatar uri={meme.uploader.avatarUrl} name={meme.uploader.username} size="sm" />
            <View className="ml-2.5">
              <Text className="text-text-primary text-sm font-semibold">Uploaded by @{meme.uploader.username}</Text>
              <Text className="text-text-muted text-xs mt-0.5">{formatRelativeTime(meme.createdAt)}</Text>
            </View>
          </Pressable>

          {/* Actions */}
          <PrimaryButton
            label={downloading ? 'Saving…' : 'Download'}
            icon={<Download size={18} color="#F5F5F0" />}
            onPress={onDownload}
            loading={downloading}
            className="mb-3"
          />
          <View className="flex-row" style={{ gap: 12 }}>
            <Pressable
              onPress={onShare}
              className="flex-1 flex-row items-center justify-center py-3.5 rounded-lg bg-surface-alt border border-border"
              accessibilityLabel="Share meme"
            >
              <Share2 size={16} color="#F5F5F0" />
              <Text className="text-text-primary text-sm font-semibold ml-2">Share</Text>
            </Pressable>
            <Pressable
              onPress={onCopyLink}
              className="flex-1 flex-row items-center justify-center py-3.5 rounded-lg bg-surface-alt border border-border"
              accessibilityLabel="Copy link"
            >
              <Link2 size={16} color="#F5F5F0" />
              <Text className="text-text-primary text-sm font-semibold ml-2">
                {copied ? 'Copied!' : 'Copy Link'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <BottomSheet visible={moreOpen} onClose={() => setMoreOpen(false)}>
        <SheetOption
          label="Report content"
          onPress={() => {
            setMoreOpen(false);
            // TODO: route to report flow
          }}
        />
        <View className="pt-1">
          <Pressable onPress={() => setMoreOpen(false)} className="py-4 items-center">
            <Text className="text-text-secondary text-base font-semibold">Cancel</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}