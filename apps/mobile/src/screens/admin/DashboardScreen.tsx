import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import StatCard from "../../components/ui/StatCard";
import Button from "../../components/ui/Button";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AdminStackParamList } from "../../navigation/AdminNavigator";
import { adminApi } from "../../api/admin.api";

type Stats = Awaited<ReturnType<typeof adminApi.getDashboardStats>>;
type ActivityItem = Awaited<ReturnType<typeof adminApi.getRecentActivity>>[number];

const ugx = (n: number) =>
  new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(n);

export default function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, a] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getRecentActivity(5),
      ]);
      setStats(s);
      setActivity(a);
    } catch {
      Alert.alert("Error", "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <AppChrome title="Dashboard" activeKey="home" variant="admin">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, gap: 24 }}>
        <Header title="Admin command" subtitle="Live Neon data" />

        {loading ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <>
            <View style={{ gap: 12 }}>
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
                    label="Vehicles available"
                    value={String(stats?.vehicles?.available ?? 0)}
                    helper={`${stats?.vehicles?.total ?? 0} total`}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <StatCard
                    label="Monthly revenue"
                    value={ugx(stats?.revenue?.monthly ?? 0)}
                    helper={`${stats?.revenue?.successfulPayments ?? 0} payments`}
                  />
                </View>
              </View>
            </View>

            {activity.length > 0 && (
              <View style={{ gap: 8 }}>
                <Text style={{ color: "#9ca3af", fontSize: 12, fontWeight: "600", textTransform: "uppercase" }}>
                  Recent activity
                </Text>
                {activity.map((item) => (
                  <View
                    key={item.id}
                    style={{ backgroundColor: "#111827", borderRadius: 12, padding: 12 }}
                  >
                    <Text style={{ color: "#fff", fontSize: 13 }}>{item.action}</Text>
                    {item.entityType ? (
                      <Text style={{ color: "#6b7280", fontSize: 11, marginTop: 2 }}>
                        {item.entityType} · {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}

            <Button label="Monitor sync" onPress={() => navigation.navigate("MonitorSync")} />
          </>
        )}
      </ScrollView>
    </AppChrome>
  );
}
