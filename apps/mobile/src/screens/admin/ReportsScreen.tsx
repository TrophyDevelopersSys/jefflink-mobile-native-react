import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import EmptyState from "../../components/ui/EmptyState";
import { adminApi } from "../../api/admin.api";

const STATUS_COLORS: Record<string, string> = {
  OPEN: "#f59e0b",
  open: "#f59e0b",
  RESOLVED: "#22c55e",
  resolved: "#22c55e",
  DISMISSED: "#6b7280",
  dismissed: "#6b7280",
};

type TabKey = "all" | "OPEN" | "RESOLVED";

export default function ReportsScreen() {
  const [reports, setReports] = useState<any[]>([]);
  const [tab, setTab] = useState<TabKey>("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listReports();
      setReports(data as any[]);
    } catch {
      Alert.alert("Error", "Could not load reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = tab === "all" ? reports : reports.filter((r) => r.status === tab);

  const handleResolve = (item: any) => {
    const id = item.id ?? item._id;
    Alert.alert("Resolve Report", `Mark report #${id} as resolved?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Resolve",
        onPress: () => {
          void adminApi.resolveReport(id, "RESOLVED", "Resolved by admin via mobile").then(load).catch(() => Alert.alert("Error", "Could not resolve report."));
        },
      },
    ]);
  };

  const TABS: { key: TabKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "OPEN", label: "Open" },
    { key: "RESOLVED", label: "Resolved" },
  ];

  return (
    <AppChrome title="Reports" activeKey="home" variant="admin">
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Header title="Reports" subtitle="User-submitted reports and issues" />

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
          <EmptyState title="No reports" message="No reports found." />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(r) => r.id ?? r._id ?? String(Math.random())}
            contentContainerStyle={{ gap: 8, paddingBottom: 32 }}
            renderItem={({ item }) => {
              const status = item.status ?? "OPEN";
              return (
                <Pressable
                  onPress={() => status === "OPEN" && handleResolve(item)}
                  style={{ backgroundColor: "#111827", borderRadius: 12, padding: 14 }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                        {item.title ?? item.subject ?? `Report #${item.id ?? item._id}`}
                      </Text>
                      <Text style={{ color: "#9ca3af", fontSize: 12, marginTop: 2 }} numberOfLines={2}>
                        {item.description ?? item.body ?? ""}
                      </Text>
                      <Text style={{ color: "#6b7280", fontSize: 11, marginTop: 2 }}>
                        {item.reporterName ?? item.reporterEmail ?? "Anonymous"} · {item.category ?? "General"}
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
                  {item.createdAt && (
                    <Text style={{ color: "#4b5563", fontSize: 11, marginTop: 4 }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  )}
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </AppChrome>
  );
}
