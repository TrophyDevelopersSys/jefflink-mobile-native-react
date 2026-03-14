import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import StatCard from "../../components/ui/StatCard";
import { adminApi } from "../../api/admin.api";

type SyncStatus = { status: string; lastSyncAt?: string };
type Stats = Awaited<ReturnType<typeof adminApi.getDashboardStats>>;

const HEALTH_COLOR = (status: string) => {
  const s = status.toLowerCase();
  if (s === "ok" || s === "healthy" || s === "up") return "#22c55e";
  if (s === "degraded" || s === "warn") return "#f59e0b";
  return "#ef4444";
};

export default function MonitorSyncScreen() {
  const [sync, setSync] = useState<SyncStatus | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sy, st] = await Promise.all([
        adminApi.getSyncStatus(),
        adminApi.getDashboardStats(),
      ]);
      setSync(sy);
      setStats(st);
    } catch {
      Alert.alert("Error", "Could not load sync status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <AppChrome title="Sync" activeKey="home" variant="admin">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, gap: 20 }}>
        <Header title="Platform monitor" subtitle="Neon DB + sync health" />

        {loading ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <>
            {/* Sync health card */}
            <View
              style={{
                backgroundColor: "#111827",
                borderRadius: 16,
                padding: 16,
                borderLeftWidth: 4,
                borderLeftColor: HEALTH_COLOR(sync?.status ?? "unknown"),
              }}
            >
              <Text style={{ color: "#9ca3af", fontSize: 11, fontWeight: "600", textTransform: "uppercase" }}>
                Sync status
              </Text>
              <Text
                style={{
                  color: HEALTH_COLOR(sync?.status ?? "unknown"),
                  fontSize: 22,
                  fontWeight: "700",
                  marginTop: 6,
                  textTransform: "uppercase",
                }}
              >
                {sync?.status ?? "UNKNOWN"}
              </Text>
              {sync?.lastSyncAt ? (
                <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>
                  Last sync: {new Date(sync.lastSyncAt).toLocaleString()}
                </Text>
              ) : null}
            </View>

            {/* Platform summary stats */}
            <Text style={{ color: "#9ca3af", fontSize: 11, fontWeight: "600", textTransform: "uppercase" }}>
              Platform summary
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <StatCard
                  label="Total users"
                  value={String(stats?.users?.total ?? 0)}
                  helper={`+${stats?.users?.newThisMonth ?? 0} this month`}
                />
              </View>
              <View style={{ flex: 1 }}>
                <StatCard
                  label="Active contracts"
                  value={String(stats?.contracts?.active ?? 0)}
                  helper={`${stats?.contracts?.total ?? 0} total`}
                />
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <StatCard
                  label="Vehicles"
                  value={String(stats?.vehicles?.available ?? 0)}
                  helper="available"
                />
              </View>
              <View style={{ flex: 1 }}>
                <StatCard
                  label="Payments processed"
                  value={String(stats?.revenue?.successfulPayments ?? 0)}
                  helper="all time"
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </AppChrome>
  );
}
