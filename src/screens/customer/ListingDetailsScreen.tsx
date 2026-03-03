import { Text, View } from "react-native";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import Header from "../../components/layout/Header";
import Badge from "../../components/ui/Badge";

export default function ListingDetailsScreen() {
  return (
    <ScreenWrapper className="px-6 pt-6">
      <View className="gap-4">
        <Header title="Listing details" subtitle="Verified asset info" />
        <Badge label="API sourced" />
        <Text className="text-sm text-brand-muted">
          Asset details, documents, and pricing will render here once loaded
          from the backend.
        </Text>
      </View>
    </ScreenWrapper>
  );
}
