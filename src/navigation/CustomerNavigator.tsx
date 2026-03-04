import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/home/HomeScreen";
import ListingsScreen from "../screens/customer/ListingsScreen";
import PaymentsScreen from "../screens/customer/PaymentsScreen";
import ProfileScreen from "../screens/customer/ProfileScreen";

export type CustomerTabParamList = {
  Home: undefined;
  Listings: undefined;
  Payments: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<CustomerTabParamList>();
const tabBarStyle = {
  backgroundColor: "#111827",
  borderTopColor: "#1F2937"
};

export default function CustomerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: "#22D3EE",
        tabBarInactiveTintColor: "#94A3B8"
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Listings" component={ListingsScreen} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
