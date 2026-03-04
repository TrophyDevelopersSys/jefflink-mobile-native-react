import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SafeAreaWrapperProps = PropsWithChildren<{ className?: string }>;

export default function SafeAreaWrapper({
  children,
  className
}: SafeAreaWrapperProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className={["flex-1 bg-brand-dark", className ?? ""]
        .filter(Boolean)
        .join(" ")}
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
