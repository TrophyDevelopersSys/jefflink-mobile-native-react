import { Text, View } from "react-native";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import Header from "../../components/layout/Header";
import Button from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <ScreenWrapper className="px-6 pt-6">
      <View className="gap-6">
        <Header title="Profile" subtitle="Secure account" />
        <View className="rounded-2xl border border-brand-slate bg-brand-night p-4">
          <Text className="text-base font-semibold text-white">
            {user?.fullName ?? "User"}
          </Text>
          <Text className="mt-2 text-sm text-brand-muted">
            {user?.email}
          </Text>
          <Text className="text-sm text-brand-muted">Role: {user?.role}</Text>
        </View>
        <Button label="Sign out" variant="danger" onPress={signOut} />
      </View>
    </ScreenWrapper>
  );
}
