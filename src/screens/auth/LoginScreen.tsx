import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function LoginScreen() {
  const [dealer, setDealer] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
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

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            placeholderTextColor="#cbd5f5"
            className="mt-2 rounded-lg border border-white/40 px-4 py-3 text-white"
          />
        </View>

        {/* Password */}
        <View className="mt-5">
          <Text className="text-white text-sm">Password</Text>

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor="#cbd5f5"
            secureTextEntry
            className="mt-2 rounded-lg border border-white/40 px-4 py-3 text-white"
          />
        </View>

        {/* Forgot Password */}
        <Pressable className="mt-3">
          <Text className="text-right text-sm text-white/80">
            Forgot Password?
          </Text>
        </Pressable>

        {/* Signin */}
        <Pressable className="mt-6 rounded-xl bg-green-500 py-4">
          <Text className="text-center font-semibold text-white">
            Sign In
          </Text>
        </Pressable>

        {/* Divider */}
        <View className="mt-6 flex-row items-center">
          <View className="h-px flex-1 bg-white/30" />
          <Text className="mx-3 text-white/80">Social Login</Text>
          <View className="h-px flex-1 bg-white/30" />
        </View>

        {/* Google Login */}
        <Pressable className="mt-4 flex-row items-center justify-center rounded-xl bg-white py-3">
          <Text className="font-semibold text-black">
            Continue with Google
          </Text>
        </Pressable>

        {/* Signup */}
        <View className="mt-6 flex-row justify-center">
          <Text className="text-white/80">
            Don't have an account?
          </Text>

          <Pressable>
            <Text className="ml-2 font-semibold text-white">
              Signup
            </Text>
          </Pressable>
        </View>

      </View>
    </LinearGradient>
  );
}