import { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import OnboardingOneScreen from "../screens/shared/onboarding/OnboardingOneScreen";
import OnboardingTwoScreen from "../screens/shared/onboarding/OnboardingTwoScreen";
import OnboardingThreeScreen from "../screens/shared/onboarding/OnboardingThreeScreen";
import LoadingScreen from "../screens/shared/LoadingScreen";
import { onboardingManager } from "../utils/onboardingManager";

export type AuthStackParamList = {
  OnboardingOne: undefined;
  OnboardingTwo: undefined;
  OnboardingThree: undefined;
  Login: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  const [initialRoute, setInitialRoute] =
    useState<keyof AuthStackParamList>("OnboardingOne");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadOnboardingState = async () => {
      const completed = await onboardingManager.isComplete();
      setInitialRoute(completed ? "Login" : "OnboardingOne");
      setReady(true);
    };

    loadOnboardingState();
  }, []);

  if (!ready) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen name="OnboardingOne" component={OnboardingOneScreen} />
      <Stack.Screen name="OnboardingTwo" component={OnboardingTwoScreen} />
      <Stack.Screen name="OnboardingThree" component={OnboardingThreeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
