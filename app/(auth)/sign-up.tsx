import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter, type Href } from 'expo-router';
import { useAuth, useSignUp } from '@clerk/expo';
import { AuthInput } from '../../components/AuthInput';
import { PrimaryButton } from '../../components/Buttons';
import { SafeAreaView } from '@/components/CustomSafeAreaView';
import { signUpSchema, verifyCodeSchema, fieldErrorsFrom } from '../../lib/validation/authSchemas';

type SignUpFieldErrors = Partial<Record<'username' | 'email' | 'password', string>>;
type VerifyFieldErrors = Partial<Record<'code', string>>;

export default function SignUpScreen() {
  const router = useRouter();
  const { isLoaded } = useAuth();
  const { signUp } = useSignUp();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({});
  const [verifyErrors, setVerifyErrors] = useState<VerifyFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onCreateAccount = async () => {
    if (!isLoaded) return;
    setFormError(null);

    const result = signUpSchema.safeParse({ username, email, password });
    if (!result.success) {
      setFieldErrors(fieldErrorsFrom(result.error));
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      const { error: createError } = await signUp.password({
        emailAddress: result.data.email,
        password: result.data.password,
        username: result.data.username,
      });
      if (createError) {
        setFormError(createError.message ?? 'Couldn\u2019t create your account. Try again.');
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setFormError(sendError.message ?? 'Couldn\u2019t send a verification code. Try again.');
        return;
      }
      setIsVerifying(true);
    } catch (e: any) {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (!isLoaded) return;
    setFormError(null);

    const result = verifyCodeSchema.safeParse({ code });
    if (!result.success) {
      setVerifyErrors(fieldErrorsFrom(result.error));
      return;
    }
    setVerifyErrors({});
    setLoading(true);

    try {
      const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code: result.data.code });
      if (verifyError) {
        setFormError(verifyError.message ?? 'That code didn\u2019t work. Double-check and try again.');
        return;
      }
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          router.replace(decorateUrl('/(tabs)') as Href);
        },
      });
    } catch (e: any) {
      setFormError('Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <View className="flex-1 px-6 justify-center">
          <Text className="text-text-primary text-2xl font-extrabold mb-1">Check your email</Text>
          <Text className="text-text-secondary text-base mb-8">
            We sent a code to {email}. Enter it below to finish setting up your account.
          </Text>
          <AuthInput
            label="Verification code"
            placeholder="123456"
            value={code}
            onChangeText={(v) => {
              setCode(v);
              if (verifyErrors.code) setVerifyErrors({});
            }}
            keyboardType="number-pad"
            error={verifyErrors.code}
          />
          {!!formError && (
            <View className="bg-danger/10 border border-danger rounded-lg px-4 py-3 mb-4">
              <Text className="text-danger text-sm">{formError}</Text>
            </View>
          )}
          <PrimaryButton label="Verify & Continue" onPress={onVerify} loading={loading} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-6 justify-center">
            <Text className="text-text-primary text-3xl font-extrabold mb-1">
              Meme<Text className="text-primary">Drop</Text>
            </Text>
            <Text className="text-text-secondary text-base mb-8">Join the chaos.</Text>

            <AuthInput
              label="Username"
              placeholder="yourusername"
              value={username}
              onChangeText={(v) => {
                setUsername(v);
                if (fieldErrors.username) setFieldErrors((e) => ({ ...e, username: undefined }));
              }}
              autoComplete="username"
              error={fieldErrors.username}
            />
            <AuthInput
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (fieldErrors.email) setFieldErrors((e) => ({ ...e, email: undefined }));
              }}
              keyboardType="email-address"
              autoComplete="email"
              error={fieldErrors.email}
            />
            <AuthInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (fieldErrors.password) setFieldErrors((e) => ({ ...e, password: undefined }));
              }}
              isPassword
              autoComplete="password-new"
              error={fieldErrors.password}
            />

            {!!formError && (
              <View className="bg-danger/10 border border-danger rounded-lg px-4 py-3 mb-4">
                <Text className="text-danger text-sm">{formError}</Text>
              </View>
            )}

            <PrimaryButton label="Create Account" onPress={onCreateAccount} loading={loading} className="mb-6" />

            <View className="flex-row justify-center">
              <Text className="text-text-secondary text-sm">Already have an account? </Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable accessibilityRole="link">
                  <Text className="text-primary text-sm font-bold">Sign In</Text>
                </Pressable>
              </Link>
            </View>

            {/* Required for the CAPTCHA challenge on Expo web sign-ups.
                Clerk skips this automatically on iOS and Android. */}
            <View nativeID="clerk-captcha" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}