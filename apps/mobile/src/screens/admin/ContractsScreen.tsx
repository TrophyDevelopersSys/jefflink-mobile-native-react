import { ActivityIndicator, Alert, FlatList, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import EmptyState from "../../components/ui/EmptyState";
import { adminApi } from "../../api/admin.api";
import type { ContractSummary } from "../../types/contract.types";

type ContractRow = ContractSummary & {
  totalAmount?: string;
  createdAt?: string;
  buyerId?: string;
};

const STATUS_COLORS: Record<string, string> = {
  active: "#22c55e",
  ACTIVE: "#22c55e",
  closed: "#6b7280",
  CLOSED: "#6b7280",
  defaulted: "#ef4444",
  DEFAULTED: "#ef4444",
};

export default function ContractsScreen() {
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listContracts();
      setContracts(data as ContractRow[]);
    } catch {
      Alert.alert("Error", "Could not load contracts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <AppChrome title="Contracts" activeKey="sell" variant="admin">
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Header title="Contracts" subtitle="Hire-purchase oversight" />
        {loading ? (
          <ActivityIndicator color="#fff" size="large" style={{ marginTop: 40 }} />
        ) : contracts.length === 0 ? (
          <EmptyState title="No contracts" message="No contracts found." />
        ) : (
          <FlatList
            data={contracts}
            keyExtractor={(c) => c.id}
            contentContainerStyle={{ gap: 8, paddingTop: 16, paddingBottom: 32 }}
            renderItem={({ item }) => (
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
                  <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
                    #{item.id.slice(-8).toUpperCase()}
                  </Text>
                  {item.createdAt ? (
                    <Text style={{ color: "#6b7280", fontSize: 11, marginTop: 2 }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  ) : null}
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  {item.totalAmount ? (
                    <Text style={{ color: "#d1d5db", fontSize: 13 }}>
                      UGX {Number(item.totalAmount).toLocaleString()}
                    </Text>
                  ) : null}
                  <View
                    style={{
                      backgroundColor: STATUS_COLORS[item.status] ?? "#6b7280",
                      borderRadius: 6,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700", textTransform: "uppercase" }}>
                      {item.status}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </AppChrome>
  );
}
