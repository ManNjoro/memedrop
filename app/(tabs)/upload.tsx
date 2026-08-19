import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { AlertCircle } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "../../components/Buttons";
import { PickedMedia, UploadDropZone } from "../../components/UploadDropZone";
import { useAuth } from "@clerk/expo";

const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 50;
const MAX_VIDEO_SECONDS = 60;

export default function UploadScreen() {
  const router = useRouter();
  const [media, setMedia] = useState<PickedMedia>(null);
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn } = useAuth();

  const validateAndSet = async (
    asset: ImagePicker.ImagePickerAsset,
    type: "image" | "video",
  ) => {
    setError(null);

    try {
      const file = new File(asset.uri);
      const info = file.info();

      const sizeMb = info.exists && info.size ? info.size / (1024 * 1024) : 0;

      if (type === "image" && sizeMb > MAX_IMAGE_MB) {
        setError(
          `Images must be under ${MAX_IMAGE_MB} MB. This file is ${sizeMb.toFixed(1)} MB.`,
        );
        return;
      }

      if (type === "video") {
        const durSec = asset.duration ? asset.duration / 1000 : 0;

        if (sizeMb > MAX_VIDEO_MB) {
          setError(
            `Videos must be under ${MAX_VIDEO_MB} MB. This file is ${sizeMb.toFixed(1)} MB.`,
          );
          return;
        }

        if (durSec > MAX_VIDEO_SECONDS) {
          setError(
            `Videos must be ${MAX_VIDEO_SECONDS}s or shorter. This one is ${Math.round(
              durSec,
            )}s.`,
          );
          return;
        }

        setDurationSec(durSec);
      }

      setMedia({
        uri: asset.uri,
        type,
      });
    } catch (error) {
      console.error("File validation error:", error);
      setError("Couldn't read that file. Try a different one.");
    }
  };

  const pick = async (type: "image" | "video") => {
  const { status } =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== "granted") {
    setError(
      "MemeDrop needs gallery access to pick media. Enable it in Settings.",
    );
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes:
      type === "image"
        ? ['images']
        : ['videos'],

    quality: 0.9,

    videoMaxDuration:
      type === "video" ? MAX_VIDEO_SECONDS : undefined,
  });

  if (!result.canceled && result.assets?.[0]) {
    await validateAndSet(result.assets[0], type);
  }
};

  const onClear = () => {
    setMedia(null);
    setDurationSec(null);
    setError(null);
  };

  const onContinue = () => {
    if (!media) return;
    if (!isSignedIn) {
      router.push('/(auth)/sign-in');
      return;
    }
    router.push({
      pathname: "/upload/details",
      params: {
        uri: media.uri,
        type: media.type,
        durationSec: String(durationSec ?? ""),
      },
    });
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        <Text className="text-text-primary text-2xl font-extrabold pt-2 mb-6">
          Drop a meme
        </Text>

        <UploadDropZone
          media={media}
          onPickPhoto={() => pick("image")}
          onPickVideo={() => pick("video")}
          onClear={onClear}
        />

        {error && (
          <View className="flex-row items-start bg-danger/10 border border-danger rounded-lg px-4 py-3 mt-4">
            <AlertCircle size={16} color="#F5484B" style={{ marginTop: 2 }} />
            <Text className="text-danger text-sm ml-2 flex-1 leading-5">
              {error}
            </Text>
          </View>
        )}

        {/* Requirements */}
        <View className="bg-surface rounded-lg border border-border px-4 py-4 mt-5">
          <Text className="text-text-primary text-sm font-bold mb-2.5">
            Upload requirements
          </Text>
          <View className="mb-1.5">
            <Text className="text-text-secondary text-xs">
              <Text className="font-semibold text-text-primary">Images</Text> —
              Maximum {MAX_IMAGE_MB} MB
            </Text>
          </View>
          <View>
            <Text className="text-text-secondary text-xs">
              <Text className="font-semibold text-text-primary">Videos</Text> —
              Maximum {MAX_VIDEO_MB} MB, up to {MAX_VIDEO_SECONDS}s
            </Text>
          </View>
        </View>

        <PrimaryButton
          label="Continue"
          onPress={onContinue}
          disabled={!media}
          className="mt-6 mb-8"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
