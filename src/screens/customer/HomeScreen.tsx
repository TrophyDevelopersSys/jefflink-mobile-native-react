import { Text, View } from "react-native";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import Header from "../../components/layout/Header";
import BalanceSummary from "../../components/finance/BalanceSummary";
import Card from "../../components/ui/Card";

export default function HomeScreen() {
  return (
    <ScreenWrapper className="px-6 pt-6">
      <View className="gap-6">
        <Header title="Customer dashboard" subtitle="Finance-safe overview" />

        <View className="gap-4">
          <BalanceSummary
            title="Next installment"
            value="Server-calculated"
            subtitle="Awaiting Neon ledger"
          />
          <BalanceSummary
            title="Outstanding balance"
            value="Server-calculated"
            subtitle="Ledger authority only"
          />
        </View>

        <Card>
          <Text className="text-base font-semibold text-white">
            Alerts and tasks
          </Text>
          <Text className="mt-2 text-sm text-brand-muted">
            Compliance notifications appear here from the backend.
          </Text>
        </Card>
      </View>
    </ScreenWrapper>
  );
}
