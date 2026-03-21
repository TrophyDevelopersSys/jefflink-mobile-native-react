import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import EmptyState from "../../components/ui/EmptyState";
import { adminApi } from "../../api/admin.api";

const STATUS_COLORS: Record<string, string> = {
  VERIFIED: "#22c55e",
  verified: "#22c55e",
  PENDING: "#f59e0b",
  pending: "#f59e0b",
  SUSPENDED: "#ef4444",
  suspended: "#ef4444",
};

export default function VendorsScreen() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listVendors();
      setVendors(data as any[]);
    } catch {
      Alert.alert("Error", "Could not load vendors.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handlePress = (vendor: any) => {
    const id = vendor.id ?? vendor._id;
    const status = vendor.verificationStatus ?? vendor.status ?? "PENDING";
    Alert.alert(
      vendor.businessName ?? vendor.name ?? "Vendor",
      `Status: ${status}`,
      [
        {
          text: "Verify",
          onPress: () => void adminApi.verifyVendor(id).then(load),
        },
        {
          text: "Suspend",
          style: "destructive",
          onPress: () => void adminApi.suspendVendor(id, "Suspended by admin").then(load),
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  return (
    <AppChrome title="Vendors" activeKey="home" variant="admin">
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Header title="Vendors" subtitle="Dealer & seller management" />
        {loading ? (
          <ActivityIndicator color="#fff" size="large" style={{ marginTop: 40 }} />
        ) : vendors.length === 0 ? (
          <EmptyState title="No vendors" message="No vendors found." />
        ) : (
          <FlatList
            data={vendors}
            keyExtractor={(v) => v.id ?? v._id ?? String(Math.random())}
            contentContainerStyle={{ gap: 8, paddingTop: 16, paddingBottom: 32 }}
            renderItem={({ item }) => {
              const status = item.verificationStatus ?? item.status ?? "PENDING";
              return (
                <Pressable
                  onPress={() => handlePress(item)}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? "#1f2937" : "#111827",
                    borderRadius: 12,
                    padding: 14,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  })}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                      {item.businessName ?? item.name ?? item.email}
                    </Text>
                    <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>
                      {item.email}
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
                    <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700", textTransform: "uppercase" }}>
                      {status}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </AppChrome>
  );
}
