import { Text, View } from "react-native";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import Card from "../../components/ui/Card";

export default function RecoveryScreen() {
  return (
    <AppChrome title="Recovery" activeKey="profile" variant="admin">
      <View className="gap-6 px-6 pt-6">
        <Header title="Recovery" subtitle="Delinquency tracking" />
        <Card>
          <Text className="text-base font-semibold text-white">
            Recovery queue
          </Text>
          <Text className="mt-2 text-sm text-brand-muted">
            Recovery actions are recorded in Neon, logs in MongoDB.
          </Text>
        </Card>
      </View>
    </AppChrome>
  );
}
