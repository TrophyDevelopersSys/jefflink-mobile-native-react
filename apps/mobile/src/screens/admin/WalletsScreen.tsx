import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import EmptyState from "../../components/ui/EmptyState";
import StatCard from "../../components/ui/StatCard";
import { adminApi } from "../../api/admin.api";

export default function WalletsScreen() {
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([
        adminApi.getWalletsSummary(),
        adminApi.getWalletTransactions(),
      ]);
      setSummary(s);
      setTransactions(t as any[]);
    } catch {
      Alert.alert("Error", "Could not load wallet data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <AppChrome title="Wallets" activeKey="home" variant="admin">
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Header title="Wallets" subtitle="Platform wallet overview" />
        {loading ? (
          <ActivityIndicator color="#fff" size="large" style={{ marginTop: 40 }} />
        ) : (
          <>
            {summary && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16, marginBottom: 16 }}>
                <StatCard label="Total Wallets" value={summary.totalWallets ?? 0} />
                <StatCard
                  label="Total Balance"
                  value={`UGX ${Number(summary.totalBalance ?? 0).toLocaleString()}`}
                />
                <StatCard label="Active" value={summary.activeWallets ?? 0} />
                <StatCard
                  label="Avg Balance"
                  value={`UGX ${Number(summary.avgBalance ?? 0).toLocaleString()}`}
                />
              </View>
            )}

            <Text style={{ color: "#9ca3af", fontSize: 13, fontWeight: "600", marginBottom: 8 }}>
              Recent Transactions
            </Text>

            {transactions.length === 0 ? (
              <EmptyState title="No transactions" message="No recent wallet transactions found." />
            ) : (
              <FlatList
                data={transactions}
                keyExtractor={(t) => t.id ?? t._id ?? String(Math.random())}
                contentContainerStyle={{ gap: 8, paddingBottom: 32 }}
                renderItem={({ item }) => (
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
                          {item.type === "CREDIT" ? "+" : "-"} UGX {Number(item.amount ?? 0).toLocaleString()}
                        </Text>
                        <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>
                          {item.description ?? item.reference ?? "Transaction"}
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: item.type === "CREDIT" ? "#166534" : "#991b1b",
                          borderRadius: 6,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                        }}
                      >
                        <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
                          {item.type ?? "N/A"}
                        </Text>
                      </View>
                    </View>
                    {item.createdAt && (
                      <Text style={{ color: "#4b5563", fontSize: 11, marginTop: 4 }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                )}
              />
            )}
          </>
        )}
      </View>
    </AppChrome>
  );
}
