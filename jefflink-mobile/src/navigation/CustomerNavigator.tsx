import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Home,
  LayoutDashboard,
  LayoutList,
  CreditCard,
  UserCircle,
  PlusCircle,
  Search,
  Zap,
} from "lucide-react-native";
import HomeScreen from "../screens/home/HomeScreen";
import ListingsScreen from "../screens/customer/ListingsScreen";
import PaymentsScreen from "../screens/customer/PaymentsScreen";
import ProfileScreen from "../screens/customer/ProfileScreen";
import SellScreen from "../screens/customer/SellScreen";
import BoostListingScreen from "../screens/vendor/BoostListingScreen";
import VendorDashboardScreen from "../screens/vendor/VendorDashboardScreen";
import { useTheme } from "../theme/useTheme";
import { useAuth } from "../hooks/useAuth";
import { useAuthStore } from "../store/auth.store";
import { Roles } from "../constants/roles";

export type ListingsFilterParams = {
  propertyType?: string;
  seller?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
};

export type CustomerTabParamList = {
  Home: undefined;
  VendorDashboard: undefined;
  Listings: ListingsFilterParams | undefined;
  Search: undefined;
  Sell: undefined;
  Payments: undefined;
  Profile: undefined;
  BoostListing: undefined;
};

const Tab = createBottomTabNavigator<CustomerTabParamList>();

export default function CustomerNavigator() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isGuest = useAuthStore((s) => s.isGuest);

  const role = user?.role ?? (isGuest ? "GUEST" : "GUEST");

  const screenOptions = {
    headerShown: false,
    tabBarStyle: {
      backgroundColor: theme.surface,
      borderTopColor: theme.border,
    },
    tabBarActiveTintColor: theme.accent,
    tabBarInactiveTintColor: theme.textMuted,
  };

  // ── Vendor / Dealer (AGENT): Dashboard | Boost | Sell | Profile ──────
  if (role === Roles.Agent) {
    return (
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen
          name="VendorDashboard"
          component={VendorDashboardScreen}
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} strokeWidth={1.8} />,
          }}
        />
        <Tab.Screen
          name="BoostListing"
          component={BoostListingScreen}
          options={{
            title: "Boost",
            tabBarIcon: ({ color, size }) => <Zap color={color} size={size} strokeWidth={1.8} />,
          }}
        />
        <Tab.Screen
          name="Sell"
          component={SellScreen}
          options={{ tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} strokeWidth={1.8} /> }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ tabBarIcon: ({ color, size }) => <UserCircle color={color} size={size} strokeWidth={1.8} /> }}
        />
      </Tab.Navigator>
    );
  }

  // ── Buyer (CUSTOMER): Home | Listings | Finance | Profile ───────────────
  if (role === Roles.Customer) {
    return (
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ tabBarIcon: ({ color, size }) => <Home color={color} size={size} strokeWidth={1.8} /> }}
        />
        <Tab.Screen
          name="Listings"
          component={ListingsScreen}
          options={{ tabBarIcon: ({ color, size }) => <LayoutList color={color} size={size} strokeWidth={1.8} /> }}
        />
        <Tab.Screen
          name="Payments"
          component={PaymentsScreen}
          options={{
            title: "Finance",
            tabBarIcon: ({ color, size }) => <CreditCard color={color} size={size} strokeWidth={1.8} />,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ tabBarIcon: ({ color, size }) => <UserCircle color={color} size={size} strokeWidth={1.8} /> }}
        />
      </Tab.Navigator>
    );
  }

  // ── Guest (not logged in): Home | Listings | Sell | Search ──────────────
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color, size }) => <Home color={color} size={size} strokeWidth={1.8} /> }}
      />
      <Tab.Screen
        name="Listings"
        component={ListingsScreen}
        options={{ tabBarIcon: ({ color, size }) => <LayoutList color={color} size={size} strokeWidth={1.8} /> }}
      />
      <Tab.Screen
        name="Sell"
        component={SellScreen}
        options={{ tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} strokeWidth={1.8} /> }}
      />
      <Tab.Screen
        name="Search"
        component={ListingsScreen}
        options={{ tabBarIcon: ({ color, size }) => <Search color={color} size={size} strokeWidth={1.8} /> }}
      />
    </Tab.Navigator>
  );
}

