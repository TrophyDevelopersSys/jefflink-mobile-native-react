import { ActivityIndicator, Text, View } from "react-native";

export default function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-brand-dark">
      <ActivityIndicator color="#22D3EE" />
      <Text className="mt-4 text-sm text-brand-muted">Loading secure session</Text>
    </View>
  );
}
