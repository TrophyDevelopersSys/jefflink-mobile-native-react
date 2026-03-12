import { Text, View } from "react-native";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import Header from "../../components/layout/Header";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import AlertBanner from "../../components/ui/AlertBanner";
import Divider from "../../components/ui/Divider";
import DataRow from "../../components/data/DataRow";
import { useAuth } from "../../hooks/useAuth";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <ScreenWrapper className="px-6 pt-6">
      <View className="gap-6">
        <Header title="Profile" subtitle="Secure account" />
        <View className="flex-row items-center gap-4 rounded-2xl border border-brand-slate bg-brand-night p-4">
          <Avatar initials={(user?.fullName ?? "User").slice(0, 2).toUpperCase()} />
          <View className="gap-1">
            <Text className="text-base font-semibold text-white">
              {user?.fullName ?? "User"}
            </Text>
            <Text className="text-sm text-brand-muted">{user?.email}</Text>
          </View>
        </View>
        <AlertBanner tone="success" message="Account verified and finance-ready." />
        <View className="rounded-2xl border border-brand-slate bg-brand-night p-4">
          <DataRow label="Role" value={user?.role ?? "Customer"} />
          <Divider className="my-2" />
          <DataRow label="Region" value="Kampala, UG" />
          <Divider className="my-2" />
          <DataRow label="Member since" value="2023" />
        </View>
        <Button label="Sign out" variant="danger" onPress={signOut} />
      </View>
    </ScreenWrapper>
  );
}
