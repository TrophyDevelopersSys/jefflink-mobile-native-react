import { ActivityIndicator, Alert, FlatList, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import EmptyState from "../../components/ui/EmptyState";
import { adminApi } from "../../api/admin.api";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "#22c55e",
  UPDATE: "#3b82f6",
  DELETE: "#ef4444",
  LOGIN: "#8b5cf6",
  APPROVE: "#22c55e",
  REJECT: "#ef4444",
  SUSPEND: "#f59e0b",
};

export default function AuditLogsScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAuditLogs();
      setLogs(data as any[]);
    } catch {
      Alert.alert("Error", "Could not load audit logs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <AppChrome title="Audit Logs" activeKey="home" variant="admin">
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Header title="Audit Logs" subtitle="System activity and admin actions" />
        {loading ? (
          <ActivityIndicator color="#fff" size="large" style={{ marginTop: 40 }} />
        ) : logs.length === 0 ? (
          <EmptyState title="No logs" message="No audit log entries found." />
        ) : (
          <FlatList
            data={logs}
            keyExtractor={(l) => l.id ?? l._id ?? String(Math.random())}
            contentContainerStyle={{ gap: 8, paddingTop: 16, paddingBottom: 32 }}
            renderItem={({ item }) => {
              const action = (item.action ?? item.type ?? "").toUpperCase();
              return (
                <View style={{ backgroundColor: "#111827", borderRadius: 12, padding: 14 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
                        {item.description ?? item.message ?? `${action} action`}
                      </Text>
                      <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>
                        {item.adminName ?? item.adminEmail ?? item.performedBy ?? "System"} · {item.entity ?? item.resource ?? ""}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: ACTION_COLORS[action] ?? "#6b7280",
                        borderRadius: 6,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>{action}</Text>
                    </View>
                  </View>
                  {item.createdAt && (
                    <Text style={{ color: "#4b5563", fontSize: 11, marginTop: 4 }}>
                      {new Date(item.createdAt).toLocaleString()}
                    </Text>
                  )}
                </View>
              );
            }}
          />
        )}
      </View>
    </AppChrome>
  );
}
