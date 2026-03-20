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
import { resetAdminPassword } from "../../api/adminRecovery.api";

export default function AdminRecoveryResetScreen() {
  const navigation = useNavigation<any>();
  const [userId, setUserId] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async () => {
    const trimmedUserId = userId.trim();
    const trimmedToken = token.trim();

    if (!trimmedUserId) {
      setStatus("error");
      setMessage("User ID is required.");
      return;
    }
    if (!trimmedToken) {
      setStatus("error");
      setMessage("Recovery token is required.");
      return;
    }
    if (newPassword.length < 10) {
      setStatus("error");
      setMessage("Admin passwords must be at least 10 characters.");
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
      const data = await resetAdminPassword({
        userId: trimmedUserId,
        token: trimmedToken,
        newPassword,
      });
      setStatus("success");
      setMessage(
        data.message || "Admin password reset successful. Please sign in with your new password.",
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
    <AppChrome title="Reset Admin Password" activeKey="profile" variant="auth" showLogin={false}>
      <LinearGradient colors={["#1e293b", "#020617"]} style={{ flex: 1 }}>
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
              {/* Header */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: "#059669",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>A</Text>
                </View>
                <Text className="text-2xl font-bold text-white">Reset Admin Password</Text>
              </View>
              <Text className="text-sm text-white/70 mb-6">
                Enter your recovery details and choose a new password. Token expires after 15 minutes.
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
                    placeholder="UUID from recovery link"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    autoCapitalize="none"
                    className="rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white mb-4"
                  />

                  <Text className="text-sm font-medium text-white/80 mb-1">Recovery Token</Text>
                  <TextInput
                    value={token}
                    onChangeText={setToken}
                    placeholder="Token from recovery email"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    autoCapitalize="none"
                    className="rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white mb-4"
                  />

                  <Text className="text-sm font-medium text-white/80 mb-1">New Password</Text>
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="At least 10 characters"
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
                    className="rounded-xl bg-emerald-600 py-3 mb-3"
                    style={{ opacity: status === "loading" ? 0.6 : 1 }}
                  >
                    <Text className="text-center text-sm font-semibold text-white">
                      {status === "loading" ? "Resetting…" : "Reset Admin Password"}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => navigation.navigate("AdminRecoveryRequest" as never)}
                  >
                    <Text className="text-center text-sm text-white/70 mb-2">
                      Request new token
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
