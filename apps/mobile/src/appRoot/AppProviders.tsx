import type { PropsWithChildren } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";
import FontProvider from "./FontProvider";

export default function AppProviders({ children }: PropsWithChildren) {
  return (
    <FontProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <AuthProvider>{children}</AuthProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </FontProvider>
  );
}
