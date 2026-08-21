import { useAuth } from '@clerk/expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertTriangle, ArrowLeft, PartyPopper, Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../../components/Buttons';
import { TagChip } from '../../components/Chips';
import { UploadProgress } from '../../components/UploadProgress';
import { ApiClientError, apiFetch } from '../../lib/apiClient';
import { buildVideoThumbnailUrl, guessMimeType, uploadToCloudinary, type UploadSignature } from '../../lib/cloudinaryUpload';
import { fieldErrorsFrom, uploadDetailsSchema } from '../../lib/validation/uploadSchema';
import { SafeAreaView } from '@/components/CustomSafeAreaView';

type Stage = 'form' | 'uploading' | 'success' | 'error';
type FieldErrors = Partial<Record<'title' | 'description' | 'tags', string>>;

export default function UploadDetailsScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { uri, type, durationSec: durationSecParam } = useLocalSearchParams<{
    uri: string;
    type: 'image' | 'video';
    durationSec?: string;
  }>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [stage, setStage] = useState<Stage>('form');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('Uploading…');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newMemeId, setNewMemeId] = useState<string | null>(null);

  const addTag = () => {
    const clean = tagInput.trim().replace(/^#/, '').replace(/\s+/g, '');
    if (clean && !tags.includes(clean) && tags.length < 8) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const onDropIt = async () => {
    const result = uploadDetailsSchema.safeParse({ title, description, tags });
    if (!result.success) {
      setFieldErrors(fieldErrorsFrom(result.error));
      return;
    }
    setFieldErrors({});
    setStage('uploading');
    setErrorMessage(null);
    setProgress(0);

    try {
      const token = await getToken();

      // 1. Ask our API for a signed Cloudinary upload payload.
      setProgressLabel('Preparing upload…');
      const sig = await apiFetch<UploadSignature>('/api/upload/signature', {
        method: 'POST',
        token,
        body: { mediaType: type },
      });

      // 2. Upload the file straight to Cloudinary — never through our server.
      setProgressLabel('Uploading…');
      const mimeType = guessMimeType(uri, type);
      console.log('mimeType:',mimeType)
      const cloudinaryResult = await uploadToCloudinary(uri, sig, mimeType, (fraction) => {
        // Reserve the last slice of the bar for the metadata save below,
        // so the bar doesn't sit at 100% while we're still waiting on Neon.
        setProgress(fraction * 0.9);
      });
      console.log("cloudinaryResult", cloudinaryResult)

      // 3. Persist the metadata to Neon.
      setProgressLabel('Finishing up…');
      const meme = await apiFetch<{ id: string }>('/api/memes', {
        method: 'POST',
        token,
        body: {
          title: result.data.title,
          description: result.data.description || undefined,
          tags: result.data.tags,
          mediaType: type,
          cloudinaryPublicId: sig.publicId,
          mediaUrl: cloudinaryResult.secureUrl,
          thumbnailUrl: type === 'video' ? buildVideoThumbnailUrl(cloudinaryResult.secureUrl) : undefined,
          durationSec:
            type === 'video' ? (cloudinaryResult.durationSec ?? Number(durationSecParam)) || undefined : undefined,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
        },
      });

      setProgress(1);
      setNewMemeId(meme.id);
      setStage('success');
    } catch (e) {
      const message =
        e instanceof ApiClientError
          ? e.message
          : 'That meme didn\u2019t make it. Check your connection and try again.';
      setErrorMessage(message);
      setStage('error');
    }
  };

  if (stage === 'uploading') {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-8">
        <Image source={{ uri }} style={{ width: 140, height: 140, borderRadius: 16 }} resizeMode="cover" />
        <View className="w-full mt-8">
          <UploadProgress progress={progress} label={progressLabel} />
        </View>
        <Text className="text-text-muted text-xs mt-4 text-center">
          Hang tight — don&apos;t close the app while your meme drops.
        </Text>
      </SafeAreaView>
    );
  }

  if (stage === 'error') {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-8">
        <View className="w-20 h-20 rounded-full bg-danger/10 items-center justify-center mb-6">
          <AlertTriangle size={32} color="#F5484B" strokeWidth={1.75} />
        </View>
        <Text className="text-text-primary text-xl font-extrabold text-center mb-2">
          Oops. That meme didn&apos;t make it.
        </Text>
        <Text className="text-text-secondary text-sm text-center mb-8 leading-5">{errorMessage}</Text>
        <PrimaryButton label="Try Again" onPress={onDropIt} className="w-full mb-3" />
        <Pressable onPress={() => setStage('form')} className="py-3">
          <Text className="text-text-secondary text-sm font-semibold">Edit Details</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (stage === 'success') {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-8">
        <View className="w-20 h-20 rounded-full bg-secondary/15 items-center justify-center mb-6">
          <PartyPopper size={34} color="#B4F42A" />
        </View>
        <Text className="text-text-primary text-2xl font-extrabold text-center mb-2">
          Your meme is live 🎉
        </Text>
        <Text className="text-text-secondary text-sm text-center mb-8">
          It&apos;s out there now. Time to watch the downloads roll in.
        </Text>
        <PrimaryButton
          label="View Meme"
          onPress={() => router.replace(`/meme/${newMemeId}`)}
          className="w-full mb-3"
        />
        <Pressable onPress={() => router.replace('/(tabs)')} className="py-3">
          <Text className="text-text-secondary text-sm font-semibold">Back to Home</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-row items-center px-4 pt-2 pb-3">
          <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Go back" className="mr-3">
            <ArrowLeft size={22} color="#F5F5F0" />
          </Pressable>
          <Text className="text-text-primary text-xl font-extrabold">Add details</Text>
        </View>

        <ScrollView className="px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {!!uri && (
            <Image
              source={{ uri }}
              style={{ width: '100%', height: 200, borderRadius: 14 }}
              resizeMode="cover"
              className="mb-6"
            />
          )}

          <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wide mb-2">Title</Text>
          <TextInput
            value={title}
            onChangeText={(v) => {
              setTitle(v);
              if (fieldErrors.title) setFieldErrors((e) => ({ ...e, title: undefined }));
            }}
            placeholder="Give your meme a title"
            placeholderTextColor="#6B6B72"
            maxLength={80}
            className="bg-surface-alt border border-border rounded-lg px-4 py-3.5 text-text-primary text-base mb-1"
          />
          {!!fieldErrors.title && <Text className="text-danger text-xs mb-2">{fieldErrors.title}</Text>}
          <View className="mb-5" />

          <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wide mb-2">
            Description
          </Text>
          <TextInput
            value={description}
            onChangeText={(v) => {
              setDescription(v);
              if (fieldErrors.description) setFieldErrors((e) => ({ ...e, description: undefined }));
            }}
            placeholder="Add some context…"
            placeholderTextColor="#6B6B72"
            multiline
            numberOfLines={3}
            maxLength={280}
            textAlignVertical="top"
            className="bg-surface-alt border border-border rounded-lg px-4 py-3.5 text-text-primary text-base mb-1 h-24"
          />
          {!!fieldErrors.description && (
            <Text className="text-danger text-xs mb-2">{fieldErrors.description}</Text>
          )}
          <View className="mb-4" />

          <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wide mb-2">Tags</Text>
          <View className="flex-row items-center bg-surface-alt border border-border rounded-lg px-4 mb-1">
            <TextInput
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Add tags"
              placeholderTextColor="#6B6B72"
              onSubmitEditing={addTag}
              returnKeyType="done"
              className="flex-1 text-text-primary text-base py-3.5"
            />
            <Pressable onPress={addTag} hitSlop={8} accessibilityLabel="Add tag">
              <Plus size={20} color="#8B5CF6" />
            </Pressable>
          </View>
          {!!fieldErrors.tags && <Text className="text-danger text-xs mb-2">{fieldErrors.tags}</Text>}
          {tags.length > 0 && (
            <View className="flex-row flex-wrap mb-2 mt-2">
              {tags.map((t) => (
                <TagChip key={t} label={t} onRemove={() => removeTag(t)} />
              ))}
            </View>
          )}

          <PrimaryButton label="Drop It 🚀" onPress={onDropIt} disabled={title.trim().length < 3} className="mt-4" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}