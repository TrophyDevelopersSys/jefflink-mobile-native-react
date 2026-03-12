import { Text, View } from "react-native";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import Header from "../../components/layout/Header";
import Card from "../../components/ui/Card";

export default function ContractsScreen() {
  return (
    <ScreenWrapper className="px-6 pt-6">
      <View className="gap-6">
        <Header title="Contracts" subtitle="Hire purchase oversight" />
        <Card>
          <Text className="text-base font-semibold text-white">
            Contract visibility
          </Text>
          <Text className="mt-2 text-sm text-brand-muted">
            All contract data is sourced from Neon transactions.
          </Text>
        </Card>
      </View>
    </ScreenWrapper>
  );
}
