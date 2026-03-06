import React from "react";
import { Text, View } from "react-native";
import { PlusCircle } from "lucide-react-native";
import AppChrome from "../../components/layout/AppChrome";
import { useTheme } from "../../theme/useTheme";

export default function SellScreen() {
  const { theme } = useTheme();
  return (
    <AppChrome title="Sell" activeKey="sell" variant="customer" showBottomNav={false}>
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <PlusCircle size={56} color={theme.accent} strokeWidth={1.4} />
        <Text className="text-xl font-bold text-text text-center">List your vehicle</Text>
        <Text className="text-sm text-text-muted text-center">
          Create a listing to sell or hire-purchase your vehicle to verified buyers.
        </Text>
      </View>
    </AppChrome>
  );
}
