import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import EmptyState from "../../components/ui/EmptyState";
import { adminApi } from "../../api/admin.api";

type Tab = "all" | "PENDING" | "PAID" | "OVERDUE";

const STATUS_COLORS: Record<string, string> = {
  PAID: "#22c55e",
  paid: "#22c55e",
  PENDING: "#f59e0b",
  pending: "#f59e0b",
  OVERDUE: "#ef4444",
  overdue: "#ef4444",
};

export default function InstallmentsScreen() {
  const [tab, setTab] = useState<Tab>("all");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const status = tab === "all" ? undefined : tab;
      const data = await adminApi.listInstallments(1, status);
      setItems(data as any[]);
    } catch {
      Alert.alert("Error", "Could not load installments.");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { void load(); }, [load]);

  return (
    <AppChrome title="Installments" activeKey="home" variant="admin">
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Header title="Installments" subtitle="Payment schedule oversight" />

        {/* Tab switcher */}
        <View style={{ flexDirection: "row", gap: 6, marginTop: 16 }}>
          {(["all", "PENDING", "PAID", "OVERDUE"] as Tab[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={{
                flex: 1,
                backgroundColor: tab === t ? "#22c55e" : "#1f2937",
                borderRadius: 10,
                paddingVertical: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 11, textTransform: "capitalize" }}>
                {t === "all" ? "All" : t}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color="#fff" size="large" style={{ marginTop: 40 }} />
        ) : items.length === 0 ? (
          <EmptyState title="No installments" message="No installments found." />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(i) => i.id ?? i._id ?? String(Math.random())}
            contentContainerStyle={{ gap: 8, paddingTop: 16, paddingBottom: 32 }}
            renderItem={({ item }) => {
              const status = item.status ?? "PENDING";
              return (
                <View
                  style={{
                    backgroundColor: "#111827",
                    borderRadius: 12,
                    padding: 14,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                      UGX {Number(item.amount ?? 0).toLocaleString()}
                    </Text>
                    <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>
                      Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "—"}
                    </Text>
                    {item.contractId && (
                      <Text style={{ color: "#4b5563", fontSize: 11, marginTop: 1 }}>
                        Contract #{String(item.contractId).slice(-8)}
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
                    <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700", textTransform: "uppercase" }}>
                      {status}
                    </Text>
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
