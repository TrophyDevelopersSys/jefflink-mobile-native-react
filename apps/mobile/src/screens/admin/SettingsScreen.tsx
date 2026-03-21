import { ActivityIndicator, Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import { adminApi } from "../../api/admin.api";

interface PlatformSettings {
  finance: { defaultInterestRate: number; maxInstallmentMonths: number; currency: string; minDeposit: number };
  moderation: { autoFlagReportThreshold: number; requireListingReview: boolean; vendorVerificationRequired: boolean };
  notifications: { emailEnabled: boolean; pushEnabled: boolean; smsEnabled: boolean };
  platform: { maintenanceMode: boolean; autoApproveVendors: boolean };
  audit: { adminActionLogging: boolean; logRetention: string; ipCapture: boolean };
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSettings();
      setSettings(data as PlatformSettings);
    } catch {
      Alert.alert("Error", "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (updated: PlatformSettings) => {
    setSaving(true);
    try {
      const result = await adminApi.updateSettings(updated as unknown as Record<string, unknown>);
      setSettings(result as PlatformSettings);
      Alert.alert("Saved", "Settings updated successfully.");
    } catch {
      Alert.alert("Error", "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = <K extends keyof PlatformSettings>(
    section: K,
    key: keyof PlatformSettings[K],
    label: string,
  ) => {
    if (!settings) return;
    const current = settings[section][key] as boolean;
    Alert.alert(
      `${current ? "Disable" : "Enable"} ${label}?`,
      `This will ${current ? "turn off" : "turn on"} ${label}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: current ? "Disable" : "Enable",
          onPress: () => {
            const updated = {
              ...settings,
              [section]: { ...settings[section], [key]: !current },
            };
            setSettings(updated);
            save(updated);
          },
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

  if (loading) {
    return (
      <AppChrome title="Settings" activeKey="home" variant="admin">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </AppChrome>
    );
  }

  return (
    <AppChrome title="Settings" activeKey="home" variant="admin">
      <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <Header title="Admin Settings" subtitle="Platform configuration" />

        {saving && (
          <View style={{ backgroundColor: "#1e3a5f", borderRadius: 8, padding: 10, marginTop: 12 }}>
            <Text style={{ color: "#93c5fd", fontSize: 13, textAlign: "center" }}>Saving…</Text>
          </View>
        )}

        {settings && (
          <>
            {/* Finance (read-only summary) */}
            <Text style={{ color: "#9ca3af", fontSize: 13, fontWeight: "600", marginTop: 20, marginBottom: 8 }}>
              Finance
            </Text>
            <View style={{ backgroundColor: "#111827", borderRadius: 12, padding: 14, marginBottom: 8 }}>
              <Text style={{ color: "#6b7280", fontSize: 12 }}>Interest Rate</Text>
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>{settings.finance.defaultInterestRate}%</Text>
              <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 6 }}>Max Months</Text>
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>{settings.finance.maxInstallmentMonths}</Text>
              <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 6 }}>Currency</Text>
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>{settings.finance.currency}</Text>
              <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 6 }}>Min Deposit</Text>
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>{settings.finance.minDeposit}%</Text>
            </View>

            {/* Platform */}
            <Text style={{ color: "#9ca3af", fontSize: 13, fontWeight: "600", marginTop: 16, marginBottom: 8 }}>
              Platform
            </Text>
            <SettingRow
              label="Maintenance Mode"
              description="Take the platform offline for all non-admin users"
              value={settings.platform.maintenanceMode}
              onToggle={() => toggle("platform", "maintenanceMode", "Maintenance Mode")}
            />
            <SettingRow
              label="Auto-Approve Vendors"
              description="Automatically approve new vendor registrations"
              value={settings.platform.autoApproveVendors}
              onToggle={() => toggle("platform", "autoApproveVendors", "Auto-Approve Vendors")}
            />

            {/* Moderation */}
            <Text style={{ color: "#9ca3af", fontSize: 13, fontWeight: "600", marginTop: 16, marginBottom: 8 }}>
              Moderation
            </Text>
            <SettingRow
              label="Review Before Publish"
              description="All new listings require admin approval"
              value={settings.moderation.requireListingReview}
              onToggle={() => toggle("moderation", "requireListingReview", "Review Before Publish")}
            />
            <SettingRow
              label="Vendor Verification Required"
              description="Vendors must be verified before selling"
              value={settings.moderation.vendorVerificationRequired}
              onToggle={() => toggle("moderation", "vendorVerificationRequired", "Vendor Verification")}
            />

            {/* Notifications */}
            <Text style={{ color: "#9ca3af", fontSize: 13, fontWeight: "600", marginTop: 16, marginBottom: 8 }}>
              Notifications
            </Text>
            <SettingRow
              label="Email Notifications"
              description="Send email alerts for critical system events"
              value={settings.notifications.emailEnabled}
              onToggle={() => toggle("notifications", "emailEnabled", "Email Notifications")}
            />
            <SettingRow
              label="Push Notifications"
              description="Send push notifications to mobile devices"
              value={settings.notifications.pushEnabled}
              onToggle={() => toggle("notifications", "pushEnabled", "Push Notifications")}
            />
            <SettingRow
              label="SMS Notifications"
              description="SMS messages (carrier charges may apply)"
              value={settings.notifications.smsEnabled}
              onToggle={() => toggle("notifications", "smsEnabled", "SMS Notifications")}
            />

            {/* Audit (read-only) */}
            <Text style={{ color: "#9ca3af", fontSize: 13, fontWeight: "600", marginTop: 16, marginBottom: 8 }}>
              Audit &amp; Compliance
            </Text>
            <View style={{ backgroundColor: "#111827", borderRadius: 12, padding: 14, marginBottom: 8 }}>
              <Text style={{ color: "#6b7280", fontSize: 12 }}>Action Logging</Text>
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                {settings.audit.adminActionLogging ? "Enabled" : "Disabled"}
              </Text>
              <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 6 }}>Log Retention</Text>
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600", textTransform: "capitalize" }}>
                {settings.audit.logRetention}
              </Text>
              <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 6 }}>IP Capture</Text>
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                {settings.audit.ipCapture ? "Enabled" : "Disabled"}
              </Text>
            </View>

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
          </>
        )}
      </ScrollView>
    </AppChrome>
  );
}
