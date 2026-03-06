import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Controller, useForm } from "react-hook-form";
import AppChrome from "../../components/layout/AppChrome";
import { useAuth } from "../../hooks/useAuth";
import { validators } from "../../utils/validators";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [dealer, setDealer] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, status, error: authError } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    await signIn(values.email.trim(), values.password);
  });

  return (
    <AppChrome title="Login" activeKey="profile" showLogin={false}>
      <LinearGradient
        colors={["#3b82f6", "#1e3a8a"]}
        className="flex-1 justify-center px-6"
      >
        {/* Card */}
        <View className="rounded-3xl bg-white/10 p-6">

          {/* Welcome */}
          <Text className="text-2xl font-bold text-white">
            Welcome Back
          </Text>

          {/* Dealer Toggle */}
          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-white">Are you a Dealer?</Text>
            <Switch value={dealer} onValueChange={setDealer} />
          </View>

          {/* Email */}
          <View className="mt-6">
            <Text className="text-white text-sm">Email Address</Text>
            <Controller
              control={control}
              name="email"
              rules={{
                required: "Email is required",
                validate: (v) => validators.email(v.trim()) || "Enter a valid email address",
              }}
              render={({ field: { value, onChange } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter email"
                  placeholderTextColor="#cbd5f5"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  className="mt-2 rounded-lg border border-white/40 px-4 py-3 text-white"
                />
              )}
            />
            {errors.email && (
              <Text className="mt-1 text-xs text-red-300">{errors.email.message}</Text>
            )}
          </View>

          {/* Password */}
          <View className="mt-5">
            <Text className="text-white text-sm">Password</Text>
            <Controller
              control={control}
              name="password"
              rules={{ required: "Password is required" }}
              render={({ field: { value, onChange } }) => (
                <View className="mt-2 flex-row items-center rounded-lg border border-white/40 px-4">
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Enter password"
                    placeholderTextColor="#cbd5f5"
                    secureTextEntry={!showPassword}
                    autoComplete="current-password"
                    textContentType="password"
                    className="flex-1 py-3 text-white"
                  />
                  <Pressable onPress={() => setShowPassword((p) => !p)}>
                    <Text className="text-white/70 text-xs">
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                </View>
              )}
            />
            {errors.password && (
              <Text className="mt-1 text-xs text-red-300">{errors.password.message}</Text>
            )}
          </View>

          {/* Forgot Password */}
          <Pressable className="mt-3">
            <Text className="text-right text-sm text-white/80">
              Forgot Password?
            </Text>
          </Pressable>

          {/* Auth Error */}
          {authError && status === "error" && (
            <View className="mt-3 rounded-lg bg-red-500/20 px-4 py-3">
              <Text className="text-sm text-red-200">{authError}</Text>
            </View>
          )}

          {/* Sign In */}
          <Pressable
            onPress={onSubmit}
            disabled={status === "loading"}
            className="mt-6 rounded-[48px] bg-green-500 py-4"
          >
            <Text className="text-center font-semibold text-white">
              {status === "loading" ? "Signing in..." : "Sign In"}
            </Text>
          </Pressable>

          {/* Divider */}
          <View className="mt-6 flex-row items-center">
            <View className="h-px flex-1 bg-white/30" />
            <Text className="mx-3 text-white/80">Social Login</Text>
            <View className="h-px flex-1 bg-white/30" />
          </View>

          {/* Google Login */}
          <Pressable className="mt-4 flex-row items-center justify-center rounded-[48px] bg-white py-3">
            <Text className="font-semibold text-black">
              Continue with Google
            </Text>
          </Pressable>

          {/* Sign Up */}
          <View className="mt-6 flex-row justify-center">
            <Text className="text-white/80">
              Don't have an account?
            </Text>
            <Pressable onPress={() => navigation.navigate("Register")}>
              <Text className="ml-2 font-semibold text-white">
                Sign Up
              </Text>
            </Pressable>
          </View>

        </View>
      </LinearGradient>
    </AppChrome>
  );
}