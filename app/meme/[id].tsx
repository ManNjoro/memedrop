import React, { useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, Dimensions, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import * as Clipboard from 'expo-clipboard';
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
  Flag,
} from 'lucide-react-native';
import { Avatar } from '../../components/Avatar';
import { PrimaryButton } from '../../components/Buttons';
import { BottomSheet, SheetOption } from '../../components/BottomSheet';

const { width } = Dimensions.get('window');

type MemeDetail = {
  id: string;
  title: string;
  mediaType: 'image' | 'video';
  mediaUrl: string; // image url, or video file url when mediaType === 'video'
  aspectRatio: number;
  creatorName: string;
  creatorAvatar?: string | null;
  uploadedAt: string;
};

// Replace with a real fetch-by-id from your API once the backend exists.
function getMemeById(id: string): MemeDetail {
  const isVideo = id === '2' || id === 't2' || id === 's2' || id === 's5';
  return {
    id,
    title: isVideo ? 'Trying to explain recursion' : 'When you push directly to production',
    mediaType: isVideo ? 'video' : 'image',
    mediaUrl: isVideo
      ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
      : `https://picsum.photos/seed/${id}/1000/1250`,
    aspectRatio: isVideo ? 16 / 9 : 0.8,
    creatorName: isVideo ? 'otieno.dev' : 'kevin_devops',
    creatorAvatar: null,
    uploadedAt: '2 days ago',
  };
}

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
  const { status } = useEvent(player, 'statusChange', { status: player.status });
  const [muted, setMuted] = useState(false);
  const [position, setPosition] = useState(0);

  // expo-video exposes currentTime/duration on the player; poll lightly for a simple progress bar.
  React.useEffect(() => {
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
          <Pressable
            onPress={() => VideoView && player.play() /* fullscreen handled via native gesture below */}
            hitSlop={8}
            accessibilityLabel="Fullscreen"
          >
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
  const meme = getMemeById(id ?? '1');
  const [moreOpen, setMoreOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const mediaHeight = width / meme.aspectRatio;
  const shareUrl = `https://memedrop.app/meme/${meme.id}`;

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

  const onDownload = () => {
    // TODO: wire to expo-file-system / MediaLibrary download of the Cloudinary asset
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Media */}
        <View>
          {meme.mediaType === 'video' ? (
            <VideoPlayerBlock uri={meme.mediaUrl} aspectRatio={meme.aspectRatio} />
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
          <Text className="text-text-primary text-xl font-bold mb-3">{meme.title}</Text>
          <Pressable
            onPress={() => router.push(`/creator/${meme.creatorName}`)}
            // onPress={() => router.push(`/(tabs)`)}
            className="flex-row items-center mb-5"
            accessibilityLabel={`View @${meme.creatorName}'s profile`}
          >
            <Avatar uri={meme.creatorAvatar} name={meme.creatorName} size="sm" />
            <View className="ml-2.5">
              <Text className="text-text-primary text-sm font-semibold">Uploaded by @{meme.creatorName}</Text>
              <Text className="text-text-muted text-xs mt-0.5">{meme.uploadedAt}</Text>
            </View>
          </Pressable>

          {/* Actions */}
          <PrimaryButton
            label="Download"
            icon={<Download size={18} color="#F5F5F0" />}
            onPress={onDownload}
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