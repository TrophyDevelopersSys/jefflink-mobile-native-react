import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { styled } from "nativewind";
import RootNavigator from "./src/navigation/RootNavigator";

const RootView = styled(GestureHandlerRootView);

export default function App() {
  return (
    <RootView className="flex-1 bg-brand-dark">
      <SafeAreaProvider>
        <RootNavigator />
        <StatusBar style="light" />
      </SafeAreaProvider>
    </RootView>
  );
}
