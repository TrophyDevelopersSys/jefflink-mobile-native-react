import "./global.css";

import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppProviders from "./src/appRoot/AppProviders";
import RootNavigator from "./src/navigation/RootNavigator";

// Global error handler — surfaces silent crashes that cause black screens.
(ErrorUtils as any).setGlobalHandler((error: unknown, isFatal?: boolean) => {
  console.log(`[GlobalError] fatal=${isFatal}`, error);
});

export default function App() {
  return (
    <GestureHandlerRootView className="flex-1 bg-background">
      <AppProviders>
        <RootNavigator />
        <StatusBar style="auto" />
      </AppProviders>
    </GestureHandlerRootView>
  );
}
