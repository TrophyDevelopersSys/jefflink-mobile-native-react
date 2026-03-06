import React, { useState } from "react";
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
import { validators } from "../../utils/validators";
import { useAuth } from "../../hooks/useAuth";

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const STEPS = [
  { label: "Account" },
  { label: "Contact" },
  { label: "Security" },
];

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState(0);
  const [dealer, setDealer] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register, status, error: authError } = useAuth();
  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const stepFields: (keyof RegisterForm)[][] = [
    ["fullName"],
    ["email"],
    ["password", "confirmPassword"],
  ];

  const goNext = async () => {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

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
    <AppChrome title="Register" activeKey="profile" variant="auth" showLogin={false}>
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
            <View className="rounded-3xl bg-white/10 p-6 my-6">

              {/* Title */}
              <Text className="text-2xl font-bold text-white">Create Account</Text>
              <Text className="mt-1 text-sm text-white/70">Finance-ready access in minutes</Text>

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

              {/* Step 0: Account Type + Full Name */}
              {step === 0 && (
                <View className="mt-6">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-white">Registering as a Dealer?</Text>
                    <Switch value={dealer} onValueChange={setDealer} />
                  </View>
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
                </View>
              )}

              {/* Step 1: Email */}
              {step === 1 && (
                <View className="mt-6">
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
                        autoFocus
                        className="mt-2 rounded-lg border border-white/40 px-4 py-3 text-white"
                      />
                    )}
                  />
                  {errors.email && (
                    <Text className="mt-1 text-xs text-red-300">{errors.email.message}</Text>
                  )}
                </View>
              )}

              {/* Step 2: Password + Confirm */}
              {step === 2 && (
                <View className="mt-6">
                  <View>
                    <Text className="text-sm text-white">Password</Text>
                    <Controller
                      control={control}
                      name="password"
                      rules={{
                        required: "Password is required",
                        validate: (v) => validators.password(v) || "Password must be at least 8 characters",
                      }}
                      render={({ field: { value, onChange } }) => (
                        <View className="mt-2 flex-row items-center rounded-lg border border-white/40 px-4">
                          <TextInput
                            value={value}
                            onChangeText={onChange}
                            placeholder="Enter password"
                            placeholderTextColor="#cbd5f5"
                            secureTextEntry={!showPassword}
                            autoFocus
                            className="flex-1 py-3 text-white"
                          />
                          <Pressable onPress={() => setShowPassword((p) => !p)}>
                            <Text className="text-white/70 text-xs">{showPassword ? "Hide" : "Show"}</Text>
                          </Pressable>
                        </View>
                      )}
                    />
                    {errors.password && (
                      <Text className="mt-1 text-xs text-red-300">{errors.password.message}</Text>
                    )}
                  </View>
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
                        <View className="mt-2 flex-row items-center rounded-lg border border-white/40 px-4">
                          <TextInput
                            value={value}
                            onChangeText={onChange}
                            placeholder="Repeat password"
                            placeholderTextColor="#cbd5f5"
                            secureTextEntry={!showConfirm}
                            className="flex-1 py-3 text-white"
                          />
                          <Pressable onPress={() => setShowConfirm((p) => !p)}>
                            <Text className="text-white/70 text-xs">{showConfirm ? "Hide" : "Show"}</Text>
                          </Pressable>
                        </View>
                      )}
                    />
                    {errors.confirmPassword && (
                      <Text className="mt-1 text-xs text-red-300">{errors.confirmPassword.message}</Text>
                    )}
                  </View>

                  {/* API / Auth Error */}
                  {(apiError || (authError && status === "error")) && (
                    <View className="mt-4 rounded-lg bg-red-500/20 px-4 py-3">
                      <Text className="text-sm text-red-200">{apiError ?? authError}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Back / Next / Submit Navigation */}
              <View style={{ flexDirection: "row", justifyContent: step > 0 ? "space-between" : "flex-end", marginTop: 32 }}>
                {step > 0 && (
                  <Pressable
                    onPress={goBack}
                    style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.5)", borderRadius: 48, paddingHorizontal: 24, paddingVertical: 12 }}
                  >
                    <Text style={{ color: "#ffffff", fontWeight: "600" }}>Back</Text>
                  </Pressable>
                )}
                {step < STEPS.length - 1 ? (
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
                      {status === "loading" ? "Creating account..." : "Sign Up"}
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

              {/* Google Signup */}
              <Pressable className="mt-4 flex-row items-center justify-center rounded-[48px] bg-white py-3">
                <Text className="font-semibold text-black">Continue with Google</Text>
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
        </KeyboardAvoidingView>
      </LinearGradient>
    </AppChrome>
  );
}
