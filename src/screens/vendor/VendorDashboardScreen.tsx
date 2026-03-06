import React from "react";
import { ScrollView, View } from "react-native";
import AppChrome from "../../components/layout/AppChrome";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import VendorStatsCards from "../../components/dashboard/VendorStatsCards";
import QuickActions from "../../components/dashboard/QuickActions";
import ActiveListingsPreview from "../../components/dashboard/ActiveListingsPreview";
import RecentLeads from "../../components/dashboard/RecentLeads";
import PaymentSummary from "../../components/dashboard/PaymentSummary";
import PerformanceInsights from "../../components/dashboard/PerformanceInsights";
import NotificationsPanel from "../../components/dashboard/NotificationsPanel";

export default function VendorDashboardScreen() {
  return (
    <AppChrome activeKey="home" variant="vendor" showBottomNav>
      <ScrollView
        className="flex-1 bg-brand-night"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <DashboardHeader />

        <View className="px-4 mt-4">
          <VendorStatsCards />
          <QuickActions />
          <ActiveListingsPreview />
          <RecentLeads />
          <PaymentSummary />
          <PerformanceInsights />
          <NotificationsPanel />
        </View>
      </ScrollView>
    </AppChrome>
  );
}
