import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScreenWrapperProps = PropsWithChildren<{ className?: string }>;

export default function ScreenWrapper({
  children,
  className
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();
  const containerClass = ["flex-1 bg-brand-dark", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <View
      className={containerClass}
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right
      }}
    >
      {children}
    </View>
  );
}
