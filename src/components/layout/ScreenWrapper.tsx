import type { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenWrapperProps = PropsWithChildren<{ className?: string }>;

export default function ScreenWrapper({
  children,
  className
}: ScreenWrapperProps) {
  const containerClass = ["flex-1 bg-brand-dark", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return <SafeAreaView className={containerClass}>{children}</SafeAreaView>;
}
