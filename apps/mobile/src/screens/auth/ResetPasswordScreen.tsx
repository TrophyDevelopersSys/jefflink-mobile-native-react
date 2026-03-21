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
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import AppChrome from "../../components/layout/AppChrome";
import { resetPassword } from "../../api/authClient";

type ResetPasswordParams = {
  ResetPassword: { userId?: string; token?: string };
};

export default function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ResetPasswordParams, "ResetPassword">>();

  const [userId, setUserId] = useState(route.params?.userId ?? "");
  const [token, setToken] = useState(route.params?.token ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async () => {
    const trimmedUserId = userId.trim();
    const trimmedToken = token.trim();

    if (!trimmedUserId) {
      setStatus("error");
      setMessage("User ID is required (check your reset email).");
      return;
    }
    if (!trimmedToken) {
      setStatus("error");
      setMessage("Reset token is required (check your reset email).");
      return;
    }
    if (newPassword.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const data = await resetPassword({
        userId: trimmedUserId,
        token: trimmedToken,
        newPassword,
      });
      setStatus("success");
      setMessage(
        data.message || "Password reset successful. Please sign in with your new password.",
      );
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to reset password. The token may have expired.",
      );
    }
  };

  return (
    <AppChrome title="Reset Password" activeKey="profile" variant="auth" showLogin={false}>
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
                Enter the details from your reset email and choose a new password.
              </Text>

              {status === "success" ? (
                <View>
                  <View className="rounded-xl bg-green-900/30 px-4 py-3 mb-4">
                    <Text className="text-sm text-green-300">{message}</Text>
                  </View>
                  <Pressable
                    onPress={() => navigation.navigate("Login" as never)}
                    className="rounded-xl bg-emerald-600 py-3"
                  >
                    <Text className="text-center text-sm font-semibold text-white">
                      Go to Login
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View>
                  <Text className="text-sm font-medium text-white/80 mb-1">User ID</Text>
                  <TextInput
                    value={userId}
                    onChangeText={setUserId}
                    placeholder="From your reset email link"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    autoCapitalize="none"
                    className="rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white mb-4"
                  />

                  <Text className="text-sm font-medium text-white/80 mb-1">Reset Token</Text>
                  <TextInput
                    value={token}
                    onChangeText={setToken}
                    placeholder="From your reset email link"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    autoCapitalize="none"
                    className="rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white mb-4"
                  />

                  <Text className="text-sm font-medium text-white/80 mb-1">New Password</Text>
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="At least 8 characters"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    secureTextEntry
                    autoComplete="new-password"
                    className="rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white mb-4"
                  />

                  <Text className="text-sm font-medium text-white/80 mb-1">
                    Confirm New Password
                  </Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter new password"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    secureTextEntry
                    autoComplete="new-password"
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
                      {status === "loading" ? "Resetting…" : "Reset Password"}
                    </Text>
                  </Pressable>

                  <Pressable onPress={() => navigation.navigate("ForgotPassword" as never)}>
                    <Text className="text-center text-sm text-white/70">
                      ← Request a new reset link
                    </Text>
                  </Pressable>

                  <Pressable onPress={() => navigation.navigate("Login" as never)}>
                    <Text className="text-center text-sm text-white/70 mt-2">
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
