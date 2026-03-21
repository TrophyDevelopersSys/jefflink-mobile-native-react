import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useState } from "react";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";

export default function SettingsScreen() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoApproveVendors, setAutoApproveVendors] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const confirmToggle = (label: string, current: boolean, setter: (v: boolean) => void) => {
    Alert.alert(
      `${current ? "Disable" : "Enable"} ${label}?`,
      `This will ${current ? "turn off" : "turn on"} ${label}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: current ? "Disable" : "Enable",
          onPress: () => setter(!current),
        },
      ],
    );
  };

  const SettingRow = ({
    label,
    description,
    value,
    onToggle,
  }: {
    label: string;
    description: string;
    value: boolean;
    onToggle: () => void;
  }) => (
    <View
      style={{
        backgroundColor: "#111827",
        borderRadius: 12,
        padding: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
      }}
    >
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>{label}</Text>
        <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#374151", true: "#2563eb" }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <AppChrome title="Settings" activeKey="home" variant="admin">
      <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <Header title="Admin Settings" subtitle="Platform configuration" />

        {/* Platform */}
        <Text style={{ color: "#9ca3af", fontSize: 13, fontWeight: "600", marginTop: 20, marginBottom: 8 }}>
          Platform
        </Text>
        <SettingRow
          label="Maintenance Mode"
          description="Take the platform offline for all non-admin users"
          value={maintenanceMode}
          onToggle={() => confirmToggle("Maintenance Mode", maintenanceMode, setMaintenanceMode)}
        />
        <SettingRow
          label="Auto-Approve Vendors"
          description="Automatically approve new vendor registrations"
          value={autoApproveVendors}
          onToggle={() => confirmToggle("Auto-Approve Vendors", autoApproveVendors, setAutoApproveVendors)}
        />

        {/* Notifications */}
        <Text style={{ color: "#9ca3af", fontSize: 13, fontWeight: "600", marginTop: 16, marginBottom: 8 }}>
          Notifications
        </Text>
        <SettingRow
          label="Email Notifications"
          description="Send email alerts for critical system events"
          value={emailNotifications}
          onToggle={() => setEmailNotifications(!emailNotifications)}
        />
        <SettingRow
          label="Push Notifications"
          description="Send push notifications for admin alerts"
          value={pushNotifications}
          onToggle={() => setPushNotifications(!pushNotifications)}
        />

        {/* Danger zone */}
        <Text style={{ color: "#ef4444", fontSize: 13, fontWeight: "600", marginTop: 24, marginBottom: 8 }}>
          Danger Zone
        </Text>
        <Pressable
          onPress={() =>
            Alert.alert("Clear Cache", "Are you sure? This will clear all cached data.", [
              { text: "Cancel", style: "cancel" },
              { text: "Clear", style: "destructive", onPress: () => Alert.alert("Done", "Cache cleared.") },
            ])
          }
          style={{
            backgroundColor: "#1f2937",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#991b1b",
            padding: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#ef4444", fontSize: 14, fontWeight: "600" }}>Clear Platform Cache</Text>
        </Pressable>
      </ScrollView>
    </AppChrome>
  );
}
