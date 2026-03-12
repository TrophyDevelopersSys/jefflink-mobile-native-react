import { Text, View } from "react-native";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import Card from "../../components/ui/Card";

export default function PaymentsScreen() {
  return (
    <AppChrome title="Payments" activeKey="finance" variant="admin">
      <View className="gap-6 px-6 pt-6">
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
    </AppChrome>
  );
}
