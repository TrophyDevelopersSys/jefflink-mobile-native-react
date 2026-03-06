import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Controller, useForm } from "react-hook-form";
import AppChrome from "../../components/layout/AppChrome";
import { validators } from "../../utils/validators";
import { useAuth } from "../../hooks/useAuth";

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const [dealer, setDealer] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { register, status, error: authError } = useAuth();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    try {
      await register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        isDealer: dealer,
      });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string; code?: string };
      const isNetworkError = !err.response && (err.message === "Network Error" || err.code === "ECONNABORTED");
      const msg =
        err?.response?.data?.message ??
        (isNetworkError
          ? "Cannot reach the server. Check your internet connection or the server may be starting up — please retry in a moment."
          : err?.message ?? "Registration failed. Check your connection.");
      setApiError(msg);
    }
  });

  return (
    <AppChrome title="Register" activeKey="profile" showLogin={false}>
      <LinearGradient
        colors={["#3b82f6", "#1e3a8a"]}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Card */}
          <View className="rounded-3xl bg-white/10 p-6 my-6">

            {/* Title */}
            <Text className="text-2xl font-bold text-white">Create Account</Text>
            <Text className="mt-1 text-sm text-white/70">Finance-ready access in minutes</Text>

            {/* Dealer Toggle */}
            <View className="mt-4 flex-row items-center justify-between">
              <Text className="text-white">Registering as a Dealer?</Text>
              <Switch value={dealer} onValueChange={setDealer} />
            </View>

            {/* Full Name */}
            <View className="mt-6">
              <Text className="text-sm text-white">Full Name</Text>
              <Controller
                control={control}
                name="fullName"
                rules={{ required: "Full name is required" }}
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Jane Doe"
                    placeholderTextColor="#cbd5f5"
                    className="mt-2 rounded-lg border border-white/40 px-4 py-3 text-white"
                  />
                )}
              />
              {errors.fullName && (
                <Text className="mt-1 text-xs text-red-300">{errors.fullName.message}</Text>
              )}
            </View>

            {/* Email */}
            <View className="mt-4">
              <Text className="text-sm text-white">Email Address</Text>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: "Email is required",
                  validate: (v) => validators.email(v) || "Enter a valid email address",
                }}
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Enter email"
                    placeholderTextColor="#cbd5f5"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="mt-2 rounded-lg border border-white/40 px-4 py-3 text-white"
                  />
                )}
              />
              {errors.email && (
                <Text className="mt-1 text-xs text-red-300">{errors.email.message}</Text>
              )}
            </View>

            {/* Password */}
            <View className="mt-4">
              <Text className="text-sm text-white">Password</Text>
              <Controller
                control={control}
                name="password"
                rules={{
                  required: "Password is required",
                  validate: (v) => validators.password(v) || "Password must be at least 8 characters",
                }}
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Enter password"
                    placeholderTextColor="#cbd5f5"
                    secureTextEntry
                    className="mt-2 rounded-lg border border-white/40 px-4 py-3 text-white"
                  />
                )}
              />
              {errors.password && (
                <Text className="mt-1 text-xs text-red-300">{errors.password.message}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View className="mt-4">
              <Text className="text-sm text-white">Confirm Password</Text>
              <Controller
                control={control}
                name="confirmPassword"
                rules={{
                  required: "Please confirm your password",
                  validate: (v) => v === watch("password") || "Passwords do not match",
                }}
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Repeat password"
                    placeholderTextColor="#cbd5f5"
                    secureTextEntry
                    className="mt-2 rounded-lg border border-white/40 px-4 py-3 text-white"
                  />
                )}
              />
              {errors.confirmPassword && (
                <Text className="mt-1 text-xs text-red-300">{errors.confirmPassword.message}</Text>
              )}
            </View>

            {/* Sign Up Button */}
            {apiError && (
              <View className="mt-4 rounded-lg bg-red-500/20 px-4 py-3">
                <Text className="text-sm text-red-200">{apiError}</Text>
              </View>
            )}

            <Pressable
              onPress={onSubmit}
              disabled={status === "loading"}
              className="mt-6 rounded-[48px] bg-green-500 py-4"
            >
              <Text className="text-center font-semibold text-white">
                {status === "loading" ? "Creating account..." : "Sign Up"}
              </Text>
            </Pressable>

            {/* Divider */}
            <View className="mt-6 flex-row items-center">
              <View className="h-px flex-1 bg-white/30" />
              <Text className="mx-3 text-white/80">Social Login</Text>
              <View className="h-px flex-1 bg-white/30" />
            </View>

            {/* Google Signup */}
            <Pressable className="mt-4 flex-row items-center justify-center rounded-[48px] bg-white py-3">
              <Text className="font-semibold text-black">
                Continue with Google
              </Text>
            </Pressable>

            {/* Sign In link */}
            <View className="mt-6 flex-row justify-center">
              <Text className="text-white/80">Already have an account?</Text>
              <Pressable onPress={() => navigation.navigate("Login")}>
                <Text className="ml-2 font-semibold text-white">Sign In</Text>
              </Pressable>
            </View>

          </View>
        </ScrollView>
      </LinearGradient>
    </AppChrome>
  );
}
