import type { PropsWithChildren } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../context/ThemeContext";

export default function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </ThemeProvider>
  );
}
