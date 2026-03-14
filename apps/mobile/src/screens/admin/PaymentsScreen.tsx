import { ActivityIndicator, Alert, FlatList, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import EmptyState from "../../components/ui/EmptyState";
import { adminApi } from "../../api/admin.api";
import type { PaymentRecord } from "../../types/payment.types";

type PaymentRow = PaymentRecord & { method?: string; contractId?: string };

const STATUS_COLORS: Record<string, string> = {
  paid: "#22c55e",
  PAID: "#22c55e",
  SUCCESS: "#22c55e",
  pending: "#f59e0b",
  PENDING: "#f59e0b",
  failed: "#ef4444",
  FAILED: "#ef4444",
  overdue: "#ef4444",
  OVERDUE: "#ef4444",
};

export default function PaymentsScreen() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listPayments();
      setPayments(data as PaymentRow[]);
    } catch {
      Alert.alert("Error", "Could not load payments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <AppChrome title="Payments" activeKey="finance" variant="admin">
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Header title="Payments" subtitle="Ledger-safe records from Neon" />
        {loading ? (
          <ActivityIndicator color="#fff" size="large" style={{ marginTop: 40 }} />
        ) : payments.length === 0 ? (
          <EmptyState title="No payments" message="No payment records found." />
        ) : (
          <FlatList
            data={payments}
            keyExtractor={(p) => p.id}
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
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                    UGX {Number(item.amount).toLocaleString()}
                  </Text>
                  {item.method ? (
                    <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>
                      {item.method}
                    </Text>
                  ) : null}
                  {item.paidAt ? (
                    <Text style={{ color: "#4b5563", fontSize: 11, marginTop: 1 }}>
                      {new Date(item.paidAt).toLocaleDateString()}
                    </Text>
                  ) : null}
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
              </View>
            )}
          />
        )}
      </View>
    </AppChrome>
  );
}
