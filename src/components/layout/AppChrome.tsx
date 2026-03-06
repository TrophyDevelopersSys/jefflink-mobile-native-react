import React, { useCallback, useMemo, type PropsWithChildren } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import ScreenWrapper from "./ScreenWrapper";
import TopBar from "../navigation/TopBar";
import BottomNav, { type BottomNavItemKey } from "../navigation/BottomNav";
import { useAuth } from "../../hooks/useAuth";

type AppChromeProps = PropsWithChildren<{
  title?: string;
  activeKey?: BottomNavItemKey;
  variant?: "customer" | "vendor" | "admin" | "auth" | "none";
  className?: string;
  showLogin?: boolean;
  onLoginPress?: () => void;
  showBottomNav?: boolean;
}>;

function AppChrome({
  children,
  title,
  activeKey,
  variant = "auth",
  className,
  showLogin,
  onLoginPress,
  showBottomNav = true
}: AppChromeProps) {

  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const navMap = useMemo(() => {

    if (variant === "customer") {
      return {
        home: "Home",
        search: "Listings",
        sell: "Sell",
        finance: "Payments",
        profile: "Profile"
      };
    }

    if (variant === "vendor") {
      return {
        home: "VendorDashboard",
        search: "Listings",
        sell: "Sell",
        finance: "Payments",
        profile: "Profile"
      };
    }

    if (variant === "admin") {
      return {
        home: "Dashboard",
        search: "Users",
        sell: "Contracts",
        finance: "Payments",
        profile: "Recovery"
      };
    }

    if (variant === "auth") {
      // On auth screens every tab routes back to Login
      return {
        home: "Login",
        search: "Login",
        sell: "Login",
        finance: "Login",
        profile: "Login",
      };
    }

    return {};

  }, [variant]);

  const handleBottomNavPress = useCallback((key: BottomNavItemKey) => {

    const target = navMap[key];
    if (!target) return;

    navigation.navigate(target);

  }, [navigation, navMap]);

  const handleLogoPress = useCallback(() => {
    // "Home" is nested inside CustomerTabs. On screens that live in the same
    // root stack (e.g. Login) we navigate to CustomerTabs first; if not
    // available (auth-only navigators) we do nothing.
    const state = navigation.getState();
    const routeNames: string[] = state?.routeNames ?? [];
    if (routeNames.includes("CustomerTabs")) {
      navigation.navigate("CustomerTabs" as never);
    } else if (routeNames.includes("Home")) {
      navigation.navigate("Home" as never);
    }
    // If neither exists (e.g. pure auth flow with no home), do nothing.
  }, [navigation]);

  const handleAccountPress = useCallback(() => {
    const state = navigation.getState();
    const routeNames: string[] = state?.routeNames ?? [];
    if (routeNames.includes("Profile")) {
      navigation.navigate("Profile" as never);
    } else if (routeNames.includes("CustomerTabs")) {
      // Navigate into tabs and then to Profile
      navigation.navigate("CustomerTabs" as never);
      // Give the tab navigator a tick to mount, then navigate to Profile
      setTimeout(() => navigation.navigate("Profile" as never), 0);
    }
  }, [navigation]);

  const handleLoginPress = useCallback(() => {
    if (onLoginPress) {
      onLoginPress();
    } else {
      navigation.navigate("Login" as never);
    }
  }, [onLoginPress, navigation]);

  const onItemPress =
    variant === "none" ? undefined : handleBottomNavPress;

  return (
    <ScreenWrapper className={className} disableTopInset>

      <View className="flex-1">

        <TopBar
          title={title}
          showLogin={showLogin}
          onLoginPress={handleLoginPress}
          onLogoPress={handleLogoPress}
          isLoggedIn={isLoggedIn}
          onAccountPress={handleAccountPress}
        />

        <View className="flex-1">
          {children}
        </View>

        {showBottomNav ? (
          <BottomNav
            activeKey={activeKey}
            onItemPress={onItemPress}
          />
        ) : null}

      </View>

    </ScreenWrapper>
  );

}

export default React.memo(AppChrome);