import { Text, View } from "react-native";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import Card from "../../components/ui/Card";

export default function MonitorSyncScreen() {
  return (
    <AppChrome title="Sync" activeKey="home" variant="admin">
      <View className="gap-6 px-6 pt-6">
        <Header title="Sync monitor" subtitle="MongoDB telemetry" />
        <Card>
          <Text className="text-base font-semibold text-white">
            Sync status
          </Text>
          <Text className="mt-2 text-sm text-brand-muted">
            Operational logs and GPS feeds are visible here.
          </Text>
        </Card>
      </View>
    </AppChrome>
  );
}
