import React from "react";
import { View, Text, Pressable } from "react-native";
import { Bell, BadgeCheck } from "lucide-react-native";
import { useTheme } from "../../theme/useTheme";
import { useAuth } from "../../hooks/useAuth";
import VendorAvatar from "./VendorAvatar";

export default function DashboardHeader() {
  const { theme } = useTheme();
  const { user } = useAuth();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <View className="bg-brand-dark px-4 pt-12 pb-6">
      <View className="flex-row items-center justify-between">

        {/* Avatar + Name */}
        <View className="flex-row items-center gap-3">
          <VendorAvatar
            avatarUrl={user?.avatarUrl}
            initial={user?.fullName?.charAt(0) ?? "V"}
            size={48}
          />

          <View>
            <View className="flex-row items-center gap-1">
              <Text className="text-white text-base font-semibold">
                {user?.fullName ?? "Vendor"}
              </Text>
              <BadgeCheck size={15} color={theme.accent} strokeWidth={2} />
            </View>
            <Text className="text-brand-muted text-xs mt-0.5">{greeting}</Text>
          </View>
        </View>

        {/* Notification Bell */}
        <Pressable className="relative p-2 active:opacity-70">
          <Bell size={22} color="#F9FAFB" strokeWidth={1.6} />
          <View className="absolute top-1 right-1 w-2 h-2 bg-brand-danger rounded-full" />
        </Pressable>

      </View>
    </View>
  );
}
