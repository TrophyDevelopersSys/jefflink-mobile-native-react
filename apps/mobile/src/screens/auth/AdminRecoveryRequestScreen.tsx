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
import { requestAdminRecovery } from "../../api/adminRecovery.api";

export default function AdminRecoveryRequestScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus("loading");
    setMessage("");

    try {
      const data = await requestAdminRecovery(trimmed);
      setStatus("success");
      setMessage(
        data.message ||
          "If that email belongs to an admin account, a recovery link has been sent.",
      );
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
    <AppChrome title="Admin Recovery" activeKey="profile" variant="auth" showLogin={false}>
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
                <Text className="text-2xl font-bold text-white">Admin Recovery</Text>
              </View>
              <Text className="text-sm text-white/70 mb-6">
                Enter your admin email to receive a secure recovery link.
              </Text>

              {status === "success" ? (
                <View>
                  <View className="rounded-xl bg-green-900/30 px-4 py-3 mb-4">
                    <Text className="text-sm text-green-300">{message}</Text>
                  </View>
                  <Text className="text-xs text-white/60 text-center mb-4">
                    The recovery link is valid for 15 minutes.
                  </Text>

                  <Pressable
                    onPress={() => navigation.navigate("AdminRecoveryReset" as never)}
                    className="rounded-xl bg-emerald-600 py-3 mb-3"
                  >
                    <Text className="text-center text-sm font-semibold text-white">
                      Enter Recovery Token
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setStatus("idle");
                      setMessage("");
                    }}
                  >
                    <Text className="text-center text-sm text-white/70">
                      Resend recovery email
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
                  <Text className="text-sm font-medium text-white/80 mb-1">
                    Admin email address
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="admin@jefflinkcars.com"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
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
                      {status === "loading" ? "Sending…" : "Send Recovery Link"}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => navigation.navigate("AdminRecoveryReset" as never)}
                  >
                    <Text className="text-center text-sm text-white/70 mb-2">
                      Already have a recovery token?
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
