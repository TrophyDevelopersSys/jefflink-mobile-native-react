import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Controller, useForm } from "react-hook-form";
import AppChrome from "../../components/layout/AppChrome";
import { useAuth } from "../../hooks/useAuth";
import { validators } from "../../utils/validators";
import { AuthMessages } from "../../constants/authMessages";

interface LoginForm {
  email: string;
  password: string;
}

const STEPS = [
  { label: "Identify" },
  { label: "Verify" },
];

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState(0);
  const [dealer, setDealer] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, status, error: authError, user } = useAuth();
  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: { email: "", password: "" },
  });

  const goNext = async () => {
    const valid = await trigger(["email"]);
    if (valid) setStep(1);
  };

  const goBack = () => setStep(0);

  const onSubmit = handleSubmit(async (values) => {
    await signIn(values.email.trim(), values.password);
  });

  useEffect(() => {
    if (status !== "authenticated" || !user) {
      return;
    }

    const routeNames: string[] = navigation.getState?.()?.routeNames ?? [];
    if (!routeNames.includes("CustomerTabs")) {
      return;
    }

    navigation.reset({
      index: 0,
      routes: [{ name: "CustomerTabs" }],
    });
  }, [navigation, status, user]);

  return (
    <AppChrome title="Login" activeKey="profile" variant="auth" showLogin={false}>
      <LinearGradient colors={["#3b82f6", "#1e3a8a"]} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 32 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Card */}
            <View className="rounded-3xl bg-white/10 p-6">

              {/* Welcome */}
              <Text className="text-2xl font-bold text-white">Welcome Back</Text>

              {/* Step Indicator */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 20 }}>
                {STEPS.map((s, i) => (
                  <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        height: 32,
                        width: 32,
                        borderRadius: 16,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: i < step ? "#22c55e" : i === step ? "#ffffff" : "rgba(255,255,255,0.25)",
                      }}
                    >
                      {i < step ? (
                        <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 12 }}>✓</Text>
                      ) : (
                        <Text style={{ color: i === step ? "#1d4ed8" : "rgba(255,255,255,0.6)", fontWeight: "700", fontSize: 12 }}>
                          {i + 1}
                        </Text>
                      )}
                    </View>
                    {i < STEPS.length - 1 && (
                      <View style={{ height: 2, width: 32, backgroundColor: i < step ? "#22c55e" : "rgba(255,255,255,0.25)" }} />
                    )}
                  </View>
                ))}
              </View>
              <Text style={{ marginTop: 6, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
                Step {step + 1} of {STEPS.length} — {STEPS[step].label}
              </Text>

              {/* Step 0: Email + Dealer toggle */}
              {step === 0 && (
                <View className="mt-6">
                  {/* Dealer Toggle */}
                  <View className="flex-row items-center justify-between">
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
                        required: AuthMessages.required.email,
                        validate: (v) => validators.email(v.trim()),
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
                          autoFocus
                          className="mt-2 rounded-lg border border-white/40 px-4 py-3 text-white"
                        />
                      )}
                    />
                    {errors.email && (
                      <Text className="mt-1 text-xs text-red-300">{errors.email.message}</Text>
                    )}
                  </View>
                </View>
              )}

              {/* Step 1: Password */}
              {step === 1 && (
                <View className="mt-6">
                  <Text className="text-white text-sm">Password</Text>
                  <Controller
                    control={control}
                    name="password"
                    rules={{ required: AuthMessages.required.password }}
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
                          autoFocus
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

                  {/* Forgot Password */}
                  <Pressable className="mt-3">
                    <Text className="text-right text-sm text-white/80">Forgot Password?</Text>
                  </Pressable>

                  {/* Auth Error */}
                  {authError && status === "error" && (
                    <View className="mt-3 rounded-lg bg-red-500/20 px-4 py-3">
                      <Text className="text-sm text-red-200">{authError}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Back / Next / Submit */}
              <View style={{ flexDirection: "row", justifyContent: step > 0 ? "space-between" : "flex-end", marginTop: 32 }}>
                {step > 0 && (
                  <Pressable
                    onPress={goBack}
                    style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.5)", borderRadius: 48, paddingHorizontal: 24, paddingVertical: 12 }}
                  >
                    <Text style={{ color: "#ffffff", fontWeight: "600" }}>Back</Text>
                  </Pressable>
                )}
                {step === 0 ? (
                  <Pressable
                    onPress={goNext}
                    style={{ backgroundColor: "#22c55e", borderRadius: 48, paddingHorizontal: 32, paddingVertical: 12 }}
                  >
                    <Text style={{ color: "#ffffff", fontWeight: "600" }}>Next</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={onSubmit}
                    disabled={status === "loading"}
                    style={{ backgroundColor: "#22c55e", borderRadius: 48, paddingHorizontal: 32, paddingVertical: 12 }}
                  >
                    <Text style={{ color: "#ffffff", fontWeight: "600" }}>
                      {status === "loading" ? "Signing in..." : "Sign In"}
                    </Text>
                  </Pressable>
                )}
              </View>

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
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </AppChrome>
  );
}