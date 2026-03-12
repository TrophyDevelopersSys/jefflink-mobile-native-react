import { Image, Text, View } from "react-native";
import { View as MotiView } from "moti/build/components/view";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../../navigation/AuthNavigator";
import AppChrome from "../../../components/layout/AppChrome";
import ScrollContainer from "../../../components/layout/ScrollContainer";
import FixedCTAContainer from "../../../components/layout/FixedCTAContainer";
import Button from "../../../components/ui/Button";
import Stepper from "../../../components/ui/Stepper";

const logo = require("../../../../assets/logo.png");

type NavProp = NativeStackNavigationProp<AuthStackParamList>;

export default function OnboardingOneScreen() {
  const navigation = useNavigation<NavProp>();

  return (
    <AppChrome title="Welcome" activeKey="home" showLogin={false}>
      <View className="flex-1">
        <ScrollContainer className="gap-8 px-6 pb-10 pt-12">
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500 }}
            className="items-center gap-6"
          >
            <Image source={logo} className="h-20 w-20" />
            <Text className="text-2xl font-semibold text-white">
              Acquire with confidence
            </Text>
            <Text className="text-center text-sm text-brand-muted">
              Premium inventory, vetted sellers, and finance that never leaves the
              ledger.
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 24 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 600, delay: 120 }}
            className="rounded-3xl border border-brand-slate bg-brand-night p-6"
          >
            <Text className="text-base font-semibold text-white">
              Verified marketplaces only
            </Text>
            <Text className="mt-2 text-sm text-brand-muted">
              Every listing is finance-ready, GPS-compliant, and approved by
              JEFFLink risk.
            </Text>
          </MotiView>
        </ScrollContainer>

        <FixedCTAContainer className="gap-4">
          <Stepper total={3} current={1} />
          <Button
            label="Next"
            onPress={() => navigation.navigate("OnboardingTwo")}
          />
        </FixedCTAContainer>
      </View>
    </AppChrome>
  );
}
