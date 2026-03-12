import { Text, View } from "react-native";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import Header from "../../components/layout/Header";
import Card from "../../components/ui/Card";

export default function PaymentsScreen() {
  return (
    <ScreenWrapper className="px-6 pt-6">
      <View className="gap-6">
        <Header title="Payments" subtitle="Ledger-safe records" />
        <Card>
          <Text className="text-base font-semibold text-white">
            Payment monitoring
          </Text>
          <Text className="mt-2 text-sm text-brand-muted">
            Payment creation and status updates happen via the API only.
          </Text>
        </Card>
      </View>
    </ScreenWrapper>
  );
}
