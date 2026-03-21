import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import EmptyState from "../../components/ui/EmptyState";
import { adminApi } from "../../api/admin.api";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#22c55e",
  active: "#22c55e",
  INACTIVE: "#6b7280",
  inactive: "#6b7280",
  OFFLINE: "#ef4444",
  offline: "#ef4444",
};

type TabKey = "all" | "ACTIVE" | "INACTIVE" | "OFFLINE";

export default function GpsTrackingScreen() {
  const [devices, setDevices] = useState<any[]>([]);
  const [tab, setTab] = useState<TabKey>("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listGpsDevices();
      setDevices(data as any[]);
    } catch {
      Alert.alert("Error", "Could not load GPS devices.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = tab === "all" ? devices : devices.filter((d) => d.status === tab);
  const TABS: { key: TabKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "ACTIVE", label: "Active" },
    { key: "INACTIVE", label: "Inactive" },
    { key: "OFFLINE", label: "Offline" },
  ];

  return (
    <AppChrome title="GPS Tracking" activeKey="home" variant="admin">
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Header title="GPS Tracking" subtitle="Monitor GPS devices on assets" />

        {/* Tabs */}
        <View style={{ flexDirection: "row", gap: 6, marginTop: 16, marginBottom: 12 }}>
          {TABS.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: tab === t.key ? "#2563eb" : "#1f2937",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color="#fff" size="large" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No devices" message="No GPS devices found." />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(d) => d.id ?? d._id ?? d.imei ?? String(Math.random())}
            contentContainerStyle={{ gap: 8, paddingBottom: 32 }}
            renderItem={({ item }) => {
              const status = item.status ?? "INACTIVE";
              return (
                <View style={{ backgroundColor: "#111827", borderRadius: 12, padding: 14 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                        {item.deviceName ?? item.imei ?? "Device"}
                      </Text>
                      <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>
                        {item.assetName ?? item.vehiclePlate ?? "Unlinked"} · IMEI: {item.imei ?? "N/A"}
                      </Text>
                      {item.lastSeen && (
                        <Text style={{ color: "#4b5563", fontSize: 11, marginTop: 1 }}>
                          Last seen: {new Date(item.lastSeen).toLocaleString()}
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
                  {(item.lat || item.lng) && (
                    <Text style={{ color: "#4b5563", fontSize: 11, marginTop: 4 }}>
                      Coords: {item.lat}, {item.lng}
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
