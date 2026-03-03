import { Text, View } from "react-native";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import Header from "../../components/layout/Header";
import Card from "../../components/ui/Card";

export default function ListingsScreen() {
  return (
    <ScreenWrapper className="px-6 pt-6">
      <View className="gap-6">
        <Header title="Listings" subtitle="Vehicles and properties" />
        <Card>
          <Text className="text-base font-semibold text-white">
            Listings feed
          </Text>
          <Text className="mt-2 text-sm text-brand-muted">
            Inventory loads from the API. No client-side price math.
          </Text>
        </Card>
      </View>
    </ScreenWrapper>
  );
}
