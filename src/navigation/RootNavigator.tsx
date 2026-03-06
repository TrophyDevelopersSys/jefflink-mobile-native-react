import { useEffect } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#FFFFFF",
    card: "#FFFFFF",
    border: "#E5E7EB",
    text: "#0F172A",
  },
};
import { useAuth } from "../hooks/useAuth";
import { useRoleGuard } from "../hooks/useRoleGuard";
import { useAuthStore } from "../store/auth.store";
import { config } from "../constants/config";
import AuthNavigator from "./AuthNavigator";
import AdminNavigator from "./AdminNavigator";
import CustomerNavigator from "./CustomerNavigator";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import LoadingScreen from "../screens/shared/LoadingScreen";

export type CustomerRootStackParamList = {
  CustomerTabs: undefined;
  Login: undefined;
  Register: undefined;
};

const CustomerRootStack = createNativeStackNavigator<CustomerRootStackParamList>();

function CustomerRootNavigator() {
  return (
    <CustomerRootStack.Navigator screenOptions={{ headerShown: false }}>
      <CustomerRootStack.Screen name="CustomerTabs" component={CustomerNavigator} />
      <CustomerRootStack.Screen name="Login" component={LoginScreen} />
      <CustomerRootStack.Screen name="Register" component={RegisterScreen} />
    </CustomerRootStack.Navigator>
  );
}

export default function RootNavigator() {
  const { status, user, initialize } = useAuth();
  const { isAdmin } = useRoleGuard(user?.role);
  const isGuest = useAuthStore((s) => s.isGuest);
  // initialized becomes true once the first initialize() call completes.
  // Using this — not status — to gate the LoadingScreen prevents AuthNavigator
  // from unmounting mid-login, which was causing it to re-run its onboarding
  // check and route back to OnboardingOne on any failed login attempt.
  const initialized = useAuthStore((s) => s.initialized);

  const devBypassAuth =
    __DEV__ &&
    (config.devForceHome ||
      config.apiBaseUrl.trim() === "https://api.example.com");

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <NavigationContainer theme={AppTheme}>
      {!initialized ? (
        <LoadingScreen />
      ) : user ? (
        isAdmin ? (
          <AdminNavigator />
        ) : (
          <CustomerRootNavigator />
        )
      ) : isGuest || devBypassAuth ? (
        <CustomerRootNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
