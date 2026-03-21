import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import EmptyState from "../../components/ui/EmptyState";
import { adminApi } from "../../api/admin.api";

type Tab = "vehicles" | "properties";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  pending: "#f59e0b",
  APPROVED: "#22c55e",
  approved: "#22c55e",
  REJECTED: "#ef4444",
  rejected: "#ef4444",
};

export default function ListingsScreen() {
  const [tab, setTab] = useState<Tab>("vehicles");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = tab === "vehicles"
        ? await adminApi.getPendingVehicles()
        : await adminApi.getPendingProperties();
      setItems(data as any[]);
    } catch {
      Alert.alert("Error", "Could not load listings.");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { void load(); }, [load]);

  const handleAction = (item: any, action: "approve" | "reject") => {
    const id = item.id ?? item._id;
    if (action === "approve") {
      const fn = tab === "vehicles" ? adminApi.approveVehicle : adminApi.approveProperty;
      void fn(id).then(load).catch(() => Alert.alert("Error", "Action failed."));
    } else {
      const fn = tab === "vehicles" ? adminApi.rejectVehicle : adminApi.rejectProperty;
      void fn(id, "Rejected by admin").then(load).catch(() => Alert.alert("Error", "Action failed."));
    }
  };

  return (
    <AppChrome title="Listings" activeKey="home" variant="admin">
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Header title="Listings" subtitle="Approve or reject pending listings" />

        {/* Tab switcher */}
        <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
          {(["vehicles", "properties"] as Tab[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={{
                flex: 1,
                backgroundColor: tab === t ? "#22c55e" : "#1f2937",
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13, textTransform: "capitalize" }}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color="#fff" size="large" style={{ marginTop: 40 }} />
        ) : items.length === 0 ? (
          <EmptyState title="No pending listings" message={`No ${tab} awaiting review.`} />
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
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                        {item.title ?? item.make ?? "Listing"}
                      </Text>
                      <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>
                        {item.vendorName ?? item.sellerName ?? ""}
                        {item.price ? ` · UGX ${Number(item.price).toLocaleString()}` : ""}
                      </Text>
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
