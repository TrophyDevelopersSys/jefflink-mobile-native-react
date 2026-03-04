import { useEffect } from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { useAuth } from "../hooks/useAuth";
import { useRoleGuard } from "../hooks/useRoleGuard";
import { config } from "../constants/config";
import AuthNavigator from "./AuthNavigator";
import AdminNavigator from "./AdminNavigator";
import CustomerNavigator from "./CustomerNavigator";
import LoadingScreen from "../screens/shared/LoadingScreen";

export default function RootNavigator() {
  const { status, user, initialize } = useAuth();
  const { isAdmin } = useRoleGuard(user?.role);

  const devBypassAuth =
    __DEV__ &&
    (config.devForceHome ||
      config.apiBaseUrl.trim() === "https://api.example.com");

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <NavigationContainer theme={DarkTheme}>
      {status === "loading" || status === "idle" ? (
        <LoadingScreen />
      ) : user ? (
        isAdmin ? (
          <AdminNavigator />
        ) : (
          <CustomerNavigator />
        )
      ) : devBypassAuth ? (
        <CustomerNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
