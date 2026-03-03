import type { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

type SafeAreaWrapperProps = PropsWithChildren<{ className?: string }>;

export default function SafeAreaWrapper({
  children,
  className
}: SafeAreaWrapperProps) {
  return (
    <SafeAreaView
      className={["flex-1 bg-brand-dark", className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </SafeAreaView>
  );
}
