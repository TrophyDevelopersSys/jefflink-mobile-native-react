import { Text, View } from "react-native";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import Header from "../../components/layout/Header";
import Card from "../../components/ui/Card";

export default function MyVehiclesScreen() {
  return (
    <ScreenWrapper className="px-6 pt-6">
      <View className="gap-6">
        <Header title="My vehicles" subtitle="Contracts and GPS status" />
        <Card>
          <Text className="text-base font-semibold text-white">
            GPS visibility
          </Text>
          <Text className="mt-2 text-sm text-brand-muted">
            GPS data is streamed from MongoDB and never drives financial state.
          </Text>
        </Card>
      </View>
    </ScreenWrapper>
  );
}
