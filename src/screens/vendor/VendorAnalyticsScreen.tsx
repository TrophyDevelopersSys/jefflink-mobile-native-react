import React from "react";
import { ScrollView } from "react-native";
import AppChrome from "../../components/layout/AppChrome";
import PerformanceInsights from "../../components/dashboard/PerformanceInsights";

export default function VendorAnalyticsScreen() {
  return (
    <AppChrome title="Analytics" activeKey="sell" variant="vendor" showBottomNav={false}>
      <ScrollView
        className="flex-1 bg-brand-night"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        <PerformanceInsights />
      </ScrollView>
    </AppChrome>
  );
}
