import { ActivityIndicator, Alert, FlatList, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import EmptyState from "../../components/ui/EmptyState";
import { adminApi } from "../../api/admin.api";

const TYPE_COLORS: Record<string, string> = {
  info: "#3b82f6",
  INFO: "#3b82f6",
  warning: "#f59e0b",
  WARNING: "#f59e0b",
  error: "#ef4444",
  ERROR: "#ef4444",
  success: "#22c55e",
  SUCCESS: "#22c55e",
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listNotifications();
      setNotifications(data as any[]);
    } catch {
      Alert.alert("Error", "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <AppChrome title="Notifications" activeKey="home" variant="admin">
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Header title="Notifications" subtitle="System notifications and alerts" />
        {loading ? (
          <ActivityIndicator color="#fff" size="large" style={{ marginTop: 40 }} />
        ) : notifications.length === 0 ? (
          <EmptyState title="No notifications" message="No system notifications found." />
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(n) => n.id ?? n._id ?? String(Math.random())}
            contentContainerStyle={{ gap: 8, paddingTop: 16, paddingBottom: 32 }}
            renderItem={({ item }) => {
              const type = item.type ?? item.level ?? "info";
              return (
                <View
                  style={{
                    backgroundColor: "#111827",
                    borderRadius: 12,
                    padding: 14,
                    borderLeftWidth: 3,
                    borderLeftColor: TYPE_COLORS[type] ?? "#6b7280",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                    {item.title ?? item.subject ?? "Notification"}
                  </Text>
                  <Text style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }}>
                    {item.message ?? item.body ?? ""}
                  </Text>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
                    <Text style={{ color: TYPE_COLORS[type] ?? "#6b7280", fontSize: 11, fontWeight: "600", textTransform: "uppercase" }}>
                      {type}
                    </Text>
                    {item.createdAt && (
                      <Text style={{ color: "#4b5563", fontSize: 11 }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
    </AppChrome>
  );
}
