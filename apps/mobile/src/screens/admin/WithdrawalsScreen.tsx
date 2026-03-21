import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import EmptyState from "../../components/ui/EmptyState";
import { adminApi } from "../../api/admin.api";

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "#22c55e",
  approved: "#22c55e",
  PENDING: "#f59e0b",
  pending: "#f59e0b",
  REJECTED: "#ef4444",
  rejected: "#ef4444",
};

export default function WithdrawalsScreen() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listWithdrawals();
      setWithdrawals(data as any[]);
    } catch {
      Alert.alert("Error", "Could not load withdrawals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleAction = (item: any, action: "approve" | "reject") => {
    const id = item.id ?? item._id;
    if (action === "approve") {
      void adminApi.approveWithdrawal(id).then(load).catch(() => Alert.alert("Error", "Action failed."));
    } else {
      void adminApi.rejectWithdrawal(id, "Rejected by admin").then(load).catch(() => Alert.alert("Error", "Action failed."));
    }
  };

  return (
    <AppChrome title="Withdrawals" activeKey="home" variant="admin">
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Header title="Withdrawals" subtitle="Approve or reject withdrawal requests" />
        {loading ? (
          <ActivityIndicator color="#fff" size="large" style={{ marginTop: 40 }} />
        ) : withdrawals.length === 0 ? (
          <EmptyState title="No withdrawals" message="No withdrawal requests found." />
        ) : (
          <FlatList
            data={withdrawals}
            keyExtractor={(w) => w.id ?? w._id ?? String(Math.random())}
            contentContainerStyle={{ gap: 8, paddingTop: 16, paddingBottom: 32 }}
            renderItem={({ item }) => {
              const status = item.status ?? "PENDING";
              return (
                <View
                  style={{
                    backgroundColor: "#111827",
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                        UGX {Number(item.amount ?? 0).toLocaleString()}
                      </Text>
                      <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>
                        {item.userName ?? item.userEmail ?? "User"} · {item.method ?? "Bank Transfer"}
                      </Text>
                      {item.createdAt && (
                        <Text style={{ color: "#4b5563", fontSize: 11, marginTop: 1 }}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                    <View
                      style={{
                        backgroundColor: STATUS_COLORS[status] ?? "#6b7280",
                        borderRadius: 6,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700", textTransform: "uppercase" }}>
                        {status}
                      </Text>
                    </View>
                  </View>

                  {status === "PENDING" && (
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                      <Pressable
                        onPress={() => handleAction(item, "approve")}
                        style={{
                          flex: 1,
                          backgroundColor: "#166534",
                          borderRadius: 8,
                          paddingVertical: 8,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>Approve</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleAction(item, "reject")}
                        style={{
                          flex: 1,
                          backgroundColor: "#991b1b",
                          borderRadius: 8,
                          paddingVertical: 8,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>Reject</Text>
                      </Pressable>
                    </View>
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
