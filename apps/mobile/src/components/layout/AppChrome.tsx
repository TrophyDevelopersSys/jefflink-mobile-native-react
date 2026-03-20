import React, { useCallback, useMemo, type PropsWithChildren } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import ScreenWrapper from "./ScreenWrapper";
import TopBar from "../navigation/TopBar";
import BottomNav, { type BottomNavItemKey } from "../navigation/BottomNav";
import { useAuth } from "../../hooks/useAuth";
import { navigateToCustomerTab } from "../../navigation/navigationHelpers";

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

    navigateToCustomerTab(navigation, target);

  }, [navigation, navMap]);

  const handleLogoPress = useCallback(() => {
    const state = navigation.getState();
    const routeNames: string[] = state?.routeNames ?? [];
    if (routeNames.includes("CustomerTabs")) {
      navigateToCustomerTab(navigation, "Home");
    } else if (routeNames.includes("Home")) {
      navigation.navigate("Home" as never);
    }
  }, [navigation]);

  const handleAccountPress = useCallback(() => {
    const state = navigation.getState();
    const routeNames: string[] = state?.routeNames ?? [];
    if (routeNames.includes("Profile")) {
      navigation.navigate("Profile" as never);
    } else if (routeNames.includes("CustomerTabs")) {
      navigateToCustomerTab(navigation, "Profile");
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