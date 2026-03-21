import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import StatCard from "../../components/ui/StatCard";
import { adminApi } from "../../api/admin.api";

export default function SystemMonitoringScreen() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSystemHealth();
      setHealth(data);
    } catch {
      Alert.alert("Error", "Could not load system health.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const statusColor = (s: string) => {
    const lower = s?.toLowerCase?.() ?? "";
    if (lower === "healthy" || lower === "ok" || lower === "up") return "#22c55e";
    if (lower === "degraded" || lower === "warning") return "#f59e0b";
    return "#ef4444";
  };

  return (
    <AppChrome title="System Health" activeKey="home" variant="admin">
      <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <Header title="System Monitoring" subtitle="Platform health and uptime" />

        {loading ? (
          <ActivityIndicator color="#fff" size="large" style={{ marginTop: 40 }} />
        ) : !health ? (
          <Text style={{ color: "#9ca3af", fontSize: 14, marginTop: 20 }}>No health data available.</Text>
        ) : (
          <>
            {/* Overall status */}
            <View
              style={{
                backgroundColor: "#111827",
                borderRadius: 12,
                padding: 16,
                marginTop: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: statusColor(health.status ?? health.overall ?? ""),
                }}
              />
              <View>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                  {(health.status ?? health.overall ?? "Unknown").toUpperCase()}
                </Text>
                <Text style={{ color: "#6b7280", fontSize: 12 }}>
                  Uptime: {health.uptime ?? "N/A"}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              <StatCard label="API Latency" value={health.apiLatency ?? health.latency ?? "N/A"} />
              <StatCard label="DB Status" value={health.database ?? health.dbStatus ?? "N/A"} />
              <StatCard label="Queue" value={health.queueSize ?? health.pendingJobs ?? 0} />
              <StatCard label="Error Rate" value={health.errorRate ?? "0%"} />
              <StatCard label="Memory" value={health.memoryUsage ?? "N/A"} />
              <StatCard label="CPU" value={health.cpuUsage ?? "N/A"} />
            </View>

            {/* Services */}
            {health.services && Array.isArray(health.services) && (
              <>
                <Text style={{ color: "#9ca3af", fontSize: 13, fontWeight: "600", marginTop: 20, marginBottom: 8 }}>
                  Services
                </Text>
                {health.services.map((svc: any, i: number) => (
                  <View
                    key={svc.name ?? i}
                    style={{
                      backgroundColor: "#111827",
                      borderRadius: 10,
                      padding: 12,
                      marginBottom: 6,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 13 }}>{svc.name}</Text>
                    <View
                      style={{
                        backgroundColor: statusColor(svc.status),
                        borderRadius: 6,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700", textTransform: "uppercase" }}>
                        {svc.status}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </AppChrome>
  );
}
