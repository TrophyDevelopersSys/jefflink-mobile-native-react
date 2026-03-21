import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "../screens/admin/DashboardScreen";
import UsersScreen from "../screens/admin/UsersScreen";
import ContractsScreen from "../screens/admin/ContractsScreen";
import PaymentsScreen from "../screens/admin/PaymentsScreen";
import RecoveryScreen from "../screens/admin/RecoveryScreen";
import MonitorSyncScreen from "../screens/admin/MonitorSyncScreen";
import VendorsScreen from "../screens/admin/VendorsScreen";
import ListingsScreen from "../screens/admin/ListingsScreen";
import InstallmentsScreen from "../screens/admin/InstallmentsScreen";
import WithdrawalsScreen from "../screens/admin/WithdrawalsScreen";
import WalletsScreen from "../screens/admin/WalletsScreen";
import NotificationsScreen from "../screens/admin/NotificationsScreen";
import GpsTrackingScreen from "../screens/admin/GpsTrackingScreen";
import ReportsScreen from "../screens/admin/ReportsScreen";
import SystemMonitoringScreen from "../screens/admin/SystemMonitoringScreen";
import AuditLogsScreen from "../screens/admin/AuditLogsScreen";
import SettingsScreen from "../screens/admin/SettingsScreen";

export type AdminTabParamList = {
  Dashboard: undefined;
  Users: undefined;
  Contracts: undefined;
  Payments: undefined;
  Recovery: undefined;
};

export type AdminStackParamList = {
  AdminTabs: undefined;
  MonitorSync: undefined;
  Vendors: undefined;
  Listings: undefined;
  Installments: undefined;
  Withdrawals: undefined;
  Wallets: undefined;
  Notifications: undefined;
  GpsTracking: undefined;
  Reports: undefined;
  SystemMonitoring: undefined;
  AuditLogs: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createNativeStackNavigator<AdminStackParamList>();

const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: { display: "none" }
    }}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Users" component={UsersScreen} />
    <Tab.Screen name="Contracts" component={ContractsScreen} />
    <Tab.Screen name="Payments" component={PaymentsScreen} />
    <Tab.Screen name="Recovery" component={RecoveryScreen} />
  </Tab.Navigator>
);

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="MonitorSync" component={MonitorSyncScreen} />
      <Stack.Screen name="Vendors" component={VendorsScreen} />
      <Stack.Screen name="Listings" component={ListingsScreen} />
      <Stack.Screen name="Installments" component={InstallmentsScreen} />
      <Stack.Screen name="Withdrawals" component={WithdrawalsScreen} />
      <Stack.Screen name="Wallets" component={WalletsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="GpsTracking" component={GpsTrackingScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="SystemMonitoring" component={SystemMonitoringScreen} />
      <Stack.Screen name="AuditLogs" component={AuditLogsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
