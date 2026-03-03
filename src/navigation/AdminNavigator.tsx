import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "../screens/admin/DashboardScreen";
import UsersScreen from "../screens/admin/UsersScreen";
import ContractsScreen from "../screens/admin/ContractsScreen";
import PaymentsScreen from "../screens/admin/PaymentsScreen";
import RecoveryScreen from "../screens/admin/RecoveryScreen";
import MonitorSyncScreen from "../screens/admin/MonitorSyncScreen";

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
};

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createNativeStackNavigator<AdminStackParamList>();
const tabBarStyle = {
  backgroundColor: "#111827",
  borderTopColor: "#1F2937"
};

const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle,
      tabBarActiveTintColor: "#22D3EE",
      tabBarInactiveTintColor: "#94A3B8"
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
    </Stack.Navigator>
  );
}
