import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import EmptyState from "../../components/ui/EmptyState";
import { adminApi } from "../../api/admin.api";
import type { UserProfile } from "../../types/user.types";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#22c55e",
  active: "#22c55e",
  SUSPENDED: "#f59e0b",
  suspended: "#f59e0b",
  BANNED: "#ef4444",
  banned: "#ef4444",
  pending: "#6b7280",
};

export default function UsersScreen() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listUsers();
      setUsers(data);
    } catch {
      Alert.alert("Error", "Could not load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handlePress = (user: UserProfile) => {
    Alert.alert(
      user.fullName,
      `Status: ${user.status}`,
      [
        {
          text: "Activate",
          onPress: () => void adminApi.updateUserStatus(user.id, "ACTIVE").then(load),
        },
        {
          text: "Suspend",
          style: "destructive",
          onPress: () => void adminApi.updateUserStatus(user.id, "SUSPENDED", "Suspended by admin").then(load),
        },
        {
          text: "Ban",
          style: "destructive",
          onPress: () => void adminApi.updateUserStatus(user.id, "BANNED", "Banned by admin").then(load),
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  return (
    <AppChrome title="Users" activeKey="search" variant="admin">
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Header title="Users" subtitle="Tap a user to manage status" />
        {loading ? (
          <ActivityIndicator color="#fff" size="large" style={{ marginTop: 40 }} />
        ) : users.length === 0 ? (
          <EmptyState title="No users" message="No users found in the database." />
        ) : (
          <FlatList
            data={users}
            keyExtractor={(u) => u.id}
            contentContainerStyle={{ gap: 8, paddingTop: 16, paddingBottom: 32 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handlePress(item)}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#1f2937" : "#111827",
                  borderRadius: 12,
                  padding: 14,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                    {item.fullName}
                  </Text>
                  <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>
                    {item.email}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: STATUS_COLORS[item.status] ?? "#6b7280",
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700", textTransform: "uppercase" }}>
                    {item.status}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        )}
      </View>
    </AppChrome>
  );
}
