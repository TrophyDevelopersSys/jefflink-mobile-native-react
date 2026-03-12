import { Text, View } from "react-native";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import BalanceSummary from "../../components/finance/BalanceSummary";
import Button from "../../components/ui/Button";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AdminStackParamList } from "../../navigation/AdminNavigator";

export default function DashboardScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AdminStackParamList>>();

  return (
    <AppChrome title="Dashboard" activeKey="home" variant="admin">
      <View className="gap-6 px-6 pt-6">
        <Header title="Admin command" subtitle="Enterprise finance control" />
        <View className="gap-4">
          <BalanceSummary
            title="Ledger status"
            value="Neon authoritative"
            subtitle="All balances server-calculated"
          />
          <BalanceSummary
            title="Sync health"
            value="API monitored"
            subtitle="Mongo activity only"
          />
        </View>
        <Button
          label="Monitor sync"
          onPress={() => navigation.navigate("MonitorSync")}
        />
        <Text className="text-xs text-brand-muted">
          Financial actions remain enforced server-side.
        </Text>
      </View>
    </AppChrome>
  );
}
