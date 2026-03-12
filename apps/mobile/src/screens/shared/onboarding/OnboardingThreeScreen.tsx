import { Text, View } from "react-native";
import { View as MotiView } from "moti/build/components/view";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../../navigation/AuthNavigator";
import AppChrome from "../../../components/layout/AppChrome";
import ScrollContainer from "../../../components/layout/ScrollContainer";
import FixedCTAContainer from "../../../components/layout/FixedCTAContainer";
import Button from "../../../components/ui/Button";
import Stepper from "../../../components/ui/Stepper";
import AlertBanner from "../../../components/ui/AlertBanner";
import { useAuthStore } from "../../../store/auth.store";
import { onboardingManager } from "../../../utils/onboardingManager";

type NavProp = NativeStackNavigationProp<AuthStackParamList>;

export default function OnboardingThreeScreen() {
  const navigation = useNavigation<NavProp>();
  const setGuestMode = useAuthStore((s) => s.setGuestMode);

  const handleGetStarted = async () => {
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const handleBrowseAsGuest = async () => {
    await onboardingManager.markComplete();
    setGuestMode(true);
  };

  return (
    <AppChrome title="Welcome" activeKey="home" showLogin={false}>
      <View className="flex-1">
        <ScrollContainer className="gap-8 px-6 pb-10 pt-12">
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500 }}
          >
            <Text className="text-2xl font-semibold text-white">
              Protect every mile
            </Text>
            <Text className="mt-3 text-sm text-brand-muted">
              GPS, fraud controls, and recovery workflows keep assets secure.
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 18 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 600, delay: 120 }}
            className="gap-4"
          >
            <AlertBanner
              tone="success"
              message="GPS status is always monitored for active contracts."
            />
            <AlertBanner
              tone="warning"
              message="Risk alerts trigger automated recovery escalation."
            />
          </MotiView>
        </ScrollContainer>

        <FixedCTAContainer className="gap-4">
          <Stepper total={3} current={3} />
          <Button
            label="Get started"
            onPress={handleGetStarted}
          />
          <Button
            label="Browse as Guest"
            variant="ghost"
            onPress={handleBrowseAsGuest}
          />
        </FixedCTAContainer>
      </View>
    </AppChrome>
  );
}
