import { Text, View } from "react-native";
import { View as MotiView } from "moti/build/components/view";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../../navigation/AuthNavigator";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import ScrollContainer from "../../../components/layout/ScrollContainer";
import FixedCTAContainer from "../../../components/layout/FixedCTAContainer";
import Button from "../../../components/ui/Button";
import Stepper from "../../../components/ui/Stepper";
import StatCard from "../../../components/ui/StatCard";

type NavProp = NativeStackNavigationProp<AuthStackParamList>;

export default function OnboardingTwoScreen() {
  const navigation = useNavigation<NavProp>();

  return (
    <ScreenWrapper>
      <View className="flex-1">
        <ScrollContainer className="gap-8 px-6 pb-10 pt-12">
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500 }}
          >
            <Text className="text-2xl font-semibold text-white">
              Finance that tells the truth
            </Text>
            <Text className="mt-3 text-sm text-brand-muted">
              Your hire purchase plan is ledger-backed and reconciled end-to-end.
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 18 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 600, delay: 120 }}
            className="gap-4"
          >
            <StatCard
              label="Installment accuracy"
              value="100%"
              helper="Server-authoritative schedule"
            />
            <StatCard
              label="Ledger integrity"
              value="Live"
              helper="Double-entry verified"
            />
          </MotiView>
        </ScrollContainer>

        <FixedCTAContainer className="gap-4">
          <Stepper total={3} current={2} />
          <Button
            label="Continue"
            onPress={() => navigation.navigate("OnboardingThree")}
          />
        </FixedCTAContainer>
      </View>
    </ScreenWrapper>
  );
}
