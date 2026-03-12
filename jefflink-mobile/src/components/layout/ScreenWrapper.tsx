import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScreenWrapperProps = PropsWithChildren<{
  className?: string;
  disableTopInset?: boolean;
}>;

export default function ScreenWrapper({
  children,
  className,
  disableTopInset = false
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();
  const containerClass = ["flex-1 bg-white dark:bg-[#0F1115]", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <View
      className={containerClass}
      style={{
        paddingTop: disableTopInset ? 0 : insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right
      }}
    >
      {children}
    </View>
  );
}
