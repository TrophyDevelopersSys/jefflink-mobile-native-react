import { Text, View } from "react-native";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import Header from "../../components/layout/Header";
import Card from "../../components/ui/Card";

export default function RecoveryScreen() {
  return (
    <ScreenWrapper className="px-6 pt-6">
      <View className="gap-6">
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
    </ScreenWrapper>
  );
}
