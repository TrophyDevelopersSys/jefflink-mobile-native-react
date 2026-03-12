import { Text, View } from "react-native";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import Header from "../../components/layout/Header";
import Card from "../../components/ui/Card";

export default function UsersScreen() {
  return (
    <ScreenWrapper className="px-6 pt-6">
      <View className="gap-6">
        <Header title="Users" subtitle="Role-based access" />
        <Card>
          <Text className="text-base font-semibold text-white">
            User management
          </Text>
          <Text className="mt-2 text-sm text-brand-muted">
            Roles and permissions are enforced by the API.
          </Text>
        </Card>
      </View>
    </ScreenWrapper>
  );
}
