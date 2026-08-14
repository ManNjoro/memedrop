import React, { useState } from 'react';
import { View, Text, TextInput, Image, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Plus, PartyPopper } from 'lucide-react-native';
import { TagChip } from '../../components/Chips';
import { PrimaryButton } from '../../components/Buttons';
import { UploadProgress } from '../../components/UploadProgress';
import {SafeAreaView as RNSafeAreaView} from 'react-native-safe-area-context';
import {styled} from 'nativewind';

const SafeAreaView = styled(RNSafeAreaView);

type Stage = 'form' | 'uploading' | 'success';

export default function UploadDetailsScreen() {
  const router = useRouter();
  const { uri, type } = useLocalSearchParams<{ uri: string; type: 'image' | 'video' }>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [stage, setStage] = useState<Stage>('form');
  const [progress, setProgress] = useState(0);
  const [newMemeId, setNewMemeId] = useState<string>('new-1');

  const isValid = title.trim().length >= 3;

  const addTag = () => {
    const clean = tagInput.trim().replace(/^#/, '').replace(/\s+/g, '');
    if (clean && !tags.includes(clean) && tags.length < 8) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const onDropIt = () => {
    if (!isValid) return;
    setStage('uploading');
    setProgress(0);

    // Simulated upload — replace with real Cloudinary upload + Neon insert via your Node API.
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + 0.08 + Math.random() * 0.08;
        if (next >= 1) {
          clearInterval(interval);
          setStage('success');
          return 1;
        }
        return next;
      });
    }, 250);
  };

  if (stage === 'uploading') {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-8">
        <Image source={{ uri }} style={{ width: 140, height: 140, borderRadius: 16 }} resizeMode="cover" />
        <View className="w-full mt-8">
          <UploadProgress progress={progress} label="Uploading…" />
        </View>
        <Text className="text-text-muted text-xs mt-4 text-center">
          Hang tight — don&apos;t close the app while your meme drops.
        </Text>
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
            onChangeText={setTitle}
            placeholder="Give your meme a title"
            placeholderTextColor="#6B6B72"
            maxLength={80}
            className="bg-surface-alt border border-border rounded-lg px-4 py-3.5 text-text-primary text-base mb-1"
          />
          {title.length > 0 && title.trim().length < 3 && (
            <Text className="text-danger text-xs mb-2">Title needs at least 3 characters.</Text>
          )}
          <View className="mb-5" />

          <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wide mb-2">
            Description
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add some context…"
            placeholderTextColor="#6B6B72"
            multiline
            numberOfLines={3}
            maxLength={280}
            textAlignVertical="top"
            className="bg-surface-alt border border-border rounded-lg px-4 py-3.5 text-text-primary text-base mb-5 h-24"
          />

          <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wide mb-2">Tags</Text>
          <View className="flex-row items-center bg-surface-alt border border-border rounded-lg px-4 mb-3">
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
          {tags.length > 0 && (
            <View className="flex-row flex-wrap mb-2">
              {tags.map((t) => (
                <TagChip key={t} label={t} onRemove={() => removeTag(t)} />
              ))}
            </View>
          )}

          <PrimaryButton label="Drop It 🚀" onPress={onDropIt} disabled={!isValid} className="mt-4" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}