import { ScrollView, Text, View } from "react-native";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import Header from "../../components/layout/Header";
import PaymentItem from "../../components/finance/PaymentItem";

export default function PaymentsScreen() {
  return (
    <ScreenWrapper className="px-6 pt-6">
      <ScrollView contentContainerClassName="gap-4">
        <Header title="Payments" subtitle="Neon-backed records" />
        <View className="gap-3">
          <PaymentItem
            payment={{
              id: "--",
              contractId: "--",
              amount: "Server-calculated",
              status: "pending"
            }}
          />
          <Text className="text-xs text-brand-muted">
            Payment history is always read-only from the API.
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
