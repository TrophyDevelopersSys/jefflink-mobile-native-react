import { ActivityIndicator, Text, View } from "react-native";
import AppChrome from "../../components/layout/AppChrome";

export default function LoadingScreen() {
  return (
    <AppChrome title="Loading" activeKey="home" showLogin={false}>
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator color="#22D3EE" />
        <Text className="mt-4 text-sm text-brand-muted">Loading secure session</Text>
      </View>
    </AppChrome>
  );
}
