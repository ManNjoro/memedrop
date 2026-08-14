import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { ImagePlus, Video as VideoIcon, X } from 'lucide-react-native';

type PickedMedia = {
  uri: string;
  type: 'image' | 'video';
} | null;

type UploadDropZoneProps = {
  media: PickedMedia;
  onPickPhoto: () => void;
  onPickVideo: () => void;
  onClear: () => void;
};

/** Empty picker state + selected-media preview, reused on the Upload screen. */
export function UploadDropZone({ media, onPickPhoto, onPickVideo, onClear }: UploadDropZoneProps) {
  if (media) {
    return (
      <View className="rounded-lg overflow-hidden bg-surface border border-border">
        <Image source={{ uri: media.uri }} style={{ width: '100%', height: 320 }} resizeMode="cover" />
        <Pressable
          onPress={onClear}
          hitSlop={8}
          accessibilityLabel="Remove selected media"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 items-center justify-center"
        >
          <X size={18} color="#F5F5F0" />
        </Pressable>
        {media.type === 'video' && (
          <View className="absolute bottom-3 left-3 bg-black/60 rounded-sm px-2 py-1">
            <Text className="text-text-primary text-xs font-semibold">Video selected</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View className="rounded-lg border-2 border-dashed border-border bg-surface-alt items-center justify-center py-14 px-6">
      <View className="w-16 h-16 rounded-full bg-surface items-center justify-center mb-4">
        <ImagePlus size={28} color="#8B5CF6" />
      </View>
      <Text className="text-text-primary text-base font-bold mb-1">Choose a meme</Text>
      <Text className="text-text-muted text-sm text-center mb-6">
        Pick a photo or video from your gallery
      </Text>
      <View className="flex-row" style={{ gap: 12 }}>
        <Pressable
          onPress={onPickPhoto}
          accessibilityLabel="Choose a photo"
          className="flex-row items-center px-5 py-3 rounded-lg bg-surface border border-border"
        >
          <ImagePlus size={16} color="#F5F5F0" />
          <Text className="text-text-primary text-sm font-semibold ml-2">Photo</Text>
        </Pressable>
        <Pressable
          onPress={onPickVideo}
          accessibilityLabel="Choose a video"
          className="flex-row items-center px-5 py-3 rounded-lg bg-surface border border-border"
        >
          <VideoIcon size={16} color="#F5F5F0" />
          <Text className="text-text-primary text-sm font-semibold ml-2">Video</Text>
        </Pressable>
      </View>
    </View>
  );
}

export type { PickedMedia };