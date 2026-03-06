import React from "react";
import { Text, View } from "react-native";
import { Zap } from "lucide-react-native";
import AppChrome from "../../components/layout/AppChrome";
import { useTheme } from "../../theme/useTheme";

export default function BoostListingScreen() {
  const { theme } = useTheme();
  return (
    <AppChrome title="Boost Listing" activeKey="sell" variant="customer" showBottomNav={false}>
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <Zap size={56} color={theme.accent} strokeWidth={1.4} />
        <Text className="text-xl font-bold text-text text-center">Boost your listing</Text>
        <Text className="text-sm text-text-muted text-center">
          Promote your vehicles to the top of search results and reach more buyers faster.
        </Text>
      </View>
    </AppChrome>
  );
}
