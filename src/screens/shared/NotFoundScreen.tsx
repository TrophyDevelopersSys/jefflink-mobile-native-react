import { Text, View } from "react-native";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import Button from "../../components/ui/Button";

export default function NotFoundScreen() {
  return (
    <ScreenWrapper className="items-center justify-center px-6">
      <View className="items-center gap-4">
        <Text className="text-xl font-semibold text-white">Screen not found</Text>
        <Text className="text-center text-sm text-brand-muted">
          The requested view is unavailable. Return to a secure location.
        </Text>
        <Button label="Go back" onPress={() => {}} />
      </View>
    </ScreenWrapper>
  );
}
