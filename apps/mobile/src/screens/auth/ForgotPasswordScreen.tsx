import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import AppChrome from "../../components/layout/AppChrome";
import { forgotPassword } from "../../api/authClient";

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [resetInfo, setResetInfo] = useState<{
    userId?: string;
    token?: string;
  }>({});

  const onSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus("loading");
    setMessage("");
    setResetInfo({});

    try {
      const data = await forgotPassword(trimmed);
      setStatus("success");
      setMessage(
        data.message ||
          "If that email is registered, you'll receive a reset link shortly.",
      );
      if (data.userId && data.token) {
        setResetInfo({ userId: data.userId, token: data.token });
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Network error. Please check your connection.",
      );
    }
  };

  return (
    <AppChrome title="Forgot Password" activeKey="profile" variant="auth" showLogin={false}>
      <LinearGradient colors={["#1e3a5f", "#0a1628"]} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 24,
              paddingVertical: 32,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="rounded-3xl bg-white/10 p-6">
              <Text className="text-2xl font-bold text-white mb-1">Reset Password</Text>
              <Text className="text-sm text-white/70 mb-6">
                Enter your email and we'll send you a reset link.
              </Text>

              {status === "success" ? (
                <View>
                  <View className="rounded-xl bg-green-900/30 px-4 py-3 mb-4">
                    <Text className="text-sm text-green-300">{message}</Text>
                  </View>
                  <Text className="text-xs text-white/60 text-center mb-4">
                    Check your inbox (and spam folder) for the reset link.
                  </Text>

                  {resetInfo.userId && resetInfo.token && (
                    <Pressable
                      onPress={() =>
                        navigation.navigate("ResetPassword", {
                          userId: resetInfo.userId,
                          token: resetInfo.token,
                        })
                      }
                      className="rounded-xl bg-emerald-600 py-3 mb-3"
                    >
                      <Text className="text-center text-sm font-semibold text-white">
                        Reset Password Now
                      </Text>
                    </Pressable>
                  )}

                  <Pressable
                    onPress={() => navigation.navigate("ResetPassword" as never)}
                    className="rounded-xl bg-white/10 border border-white/20 py-3 mb-3"
                  >
                    <Text className="text-center text-sm font-semibold text-white">
                      I Have a Reset Token
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setStatus("idle");
                      setMessage("");
                    }}
                  >
                    <Text className="text-center text-sm text-white/70">
                      Resend reset email
                    </Text>
                  </Pressable>

                  <Pressable onPress={() => navigation.navigate("Login" as never)}>
                    <Text className="text-center text-sm text-white/70 mt-2">
                      ← Back to login
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View>
                  <Text className="text-sm font-medium text-white/80 mb-1">Email address</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    className="rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white mb-4"
                  />

                  {status === "error" && (
                    <View className="rounded-xl bg-red-900/30 px-4 py-3 mb-4">
                      <Text className="text-sm text-red-300">{message}</Text>
                    </View>
                  )}

                  <Pressable
                    onPress={onSubmit}
                    disabled={status === "loading"}
                    className="rounded-xl bg-emerald-600 py-3 mb-4"
                    style={{ opacity: status === "loading" ? 0.6 : 1 }}
                  >
                    <Text className="text-center text-sm font-semibold text-white">
                      {status === "loading" ? "Sending…" : "Send Reset Link"}
                    </Text>
                  </Pressable>

                  <Pressable onPress={() => navigation.navigate("Login" as never)}>
                    <Text className="text-center text-sm text-white/70">
                      ← Back to login
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </AppChrome>
  );
}
