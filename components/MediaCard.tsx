import { Download, Play, Share2 } from 'lucide-react-native';
import React, { memo, useMemo } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { Avatar } from './Avatar';

const { width } = Dimensions.get('window');

export type Meme = {
  id: string;
  title: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  durationSec?: number;
  creatorName: string;
  creatorAvatar?: string | null;
  uploadedAt: string;
  aspectRatio?: number;
};

type MediaCardProps = {
  meme: Meme;
  variant?: 'grid' | 'feed';
  onPress?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
};

function formatDuration(sec?: number) {
  if (!sec) return '';

  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);

  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const MediaCard = memo(function MediaCard({
  meme,
  variant = 'grid',
  onPress,
  onDownload,
  onShare,
}: MediaCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const iconColor = isDark ? '#F5F5F0' : '#121214';

  const { cardWidth, mediaHeight } = useMemo(() => {
    const cardWidth =
      variant === 'grid'
        ? (width - 16 * 2 - 12) / 2
        : width - 16 * 2;

    const aspect =
      meme.aspectRatio ??
      (variant === 'grid' ? 0.85 : 1.1);

    return {
      cardWidth,
      mediaHeight: cardWidth / aspect,
    };
  }, [variant, meme.aspectRatio]);

  const duration = useMemo(
    () => formatDuration(meme.durationSec),
    [meme.durationSec]
  );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open meme: ${meme.title}`}
      style={{ width: cardWidth }}
      className="mb-4 rounded-lg overflow-hidden bg-surface-light dark:bg-surface"
    >
      {/* Media */}
      <View
        style={{
          width: cardWidth,
          height: mediaHeight,
        }}
        className="bg-surface-alt-light dark:bg-surface-alt"
      >
        <Image
          source={{ uri: meme.mediaUrl }}
          style={{
            width: cardWidth,
            height: mediaHeight,
          }}
          resizeMode="cover"
        />

        {/* Video indicator */}
        {meme.mediaType === 'video' && (
          <>
            <View className="absolute inset-0 items-center justify-center bg-black/20">
              <View className="w-11 h-11 rounded-full bg-black/50 items-center justify-center">
                <Play
                  size={20}
                  color={iconColor}
                  fill={iconColor}
                />
              </View>
            </View>

            {duration && (
              <View className="absolute bottom-2 right-2 bg-black/70 rounded-sm px-1.5 py-0.5">
                <Text className="text-text-primary-light dark:text-text-primary text-xs font-medium">
                  {duration}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Quick actions */}
        {(onShare || onDownload) && (
          <View className="absolute top-2 right-2 flex-row">
            {onShare && (
              <Pressable
                onPress={onShare}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Share meme"
                className="w-8 h-8 rounded-full bg-primary/80 items-center justify-center mr-1.5"
              >
                <Share2
                  size={14}
                  color={iconColor}
                />
              </Pressable>
            )}

            {onDownload && (
              <Pressable
                onPress={onDownload}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Download meme"
                className="w-8 h-8 rounded-full bg-primary/80 items-center justify-center"
              >
                <Download
                  size={14}
                  color={iconColor}
                />
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* Details */}
      <View className="px-2.5 py-2">
        <Text
          numberOfLines={1}
          className="text-text-primary-light dark:text-text-primary text-sm font-semibold"
        >
          {meme.title}
        </Text>

        <View className="flex-row items-center mt-1.5">
          <Avatar
            uri={meme.creatorAvatar}
            name={meme.creatorName}
            size="xs"
          />

          <Text
            numberOfLines={1}
            className="text-text-muted text-xs ml-1.5 shrink"
          >
            @{meme.creatorName} · {meme.uploadedAt}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

MediaCard.displayName = 'MediaCard';