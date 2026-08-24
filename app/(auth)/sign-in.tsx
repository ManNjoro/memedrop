import { SafeAreaView } from "@/components/CustomSafeAreaView";
import { useAuth, useSignIn } from "@clerk/expo";
import { Link, router } from "expo-router";
import { usePostHog } from "posthog-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { AuthInput } from "../../components/AuthInput";
import { PrimaryButton } from "../../components/Buttons";
import { signInSchema, fieldErrorsFrom } from "../../lib/validation/authSchemas";
import { syncUser } from "../../lib/api/users";

type FieldErrors = Partial<Record<"identifier" | "password", string>>;

export default function SignInScreen() {
  const { isLoaded, getToken } = useAuth();
  const { signIn } = useSignIn();
  const posthog = usePostHog();

  // "identifier" because this Clerk instance accepts both email and username at sign-in.
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSignIn = async () => {
    if (!isLoaded) return;
    setFormError(null);

    const result = signInSchema.safeParse({ identifier, password });
    if (!result.success) {
      setFieldErrors(fieldErrorsFrom(result.error));
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      const { error: signInError } = await signIn.password({
        identifier: result.data.identifier,
        password: result.data.password,
      });
      if (signInError) {
        setFormError(
          signInError.message ??
            "Couldn\u2019t sign you in. Check your details and try again.",
        );
        return;
      }
      if (signIn.status === "complete") {
        await signIn.finalize();
        posthog.capture("user_signed_in");
        try {
          const token = await getToken();
          await syncUser(token);
          router.replace('/(tabs)')
        } catch {
          // swallow
        }
      } else {
        setFormError("Additional verification is required for this account.");
      }
    } catch (e: any) {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 justify-center">
            <Text className="text-text-primary text-3xl font-extrabold mb-1">
              Meme<Text className="text-primary">Drop</Text>
            </Text>
            <Text className="text-text-secondary text-base mb-8">
              MemeDrop is better with you.
            </Text>

            <AuthInput
              label="Email or Username"
              placeholder="you@example.com or username"
              value={identifier}
              onChangeText={(v) => {
                setIdentifier(v);
                if (fieldErrors.identifier) setFieldErrors((e) => ({ ...e, identifier: undefined }));
              }}
              autoComplete="username"
              error={fieldErrors.identifier}
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
              autoComplete="password"
              error={fieldErrors.password}
            />

            {!!formError && (
              <View className="bg-danger/10 border border-danger rounded-lg px-4 py-3 mb-4">
                <Text className="text-danger text-sm">{formError}</Text>
              </View>
            )}

            <PrimaryButton
              label="Sign In"
              onPress={onSignIn}
              loading={loading}
              className="mb-3"
            />

            <View className="flex-row items-center my-2">
              <View className="flex-1 h-px bg-border" />
              <Text className="text-text-muted text-xs mx-3">or</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            <View className="flex-row justify-center mt-8">
              <Text className="text-text-secondary text-sm">
                Don&apos;t have an account?{" "}
              </Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable accessibilityRole="link">
                  <Text className="text-primary text-sm font-bold">
                    Sign Up
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}