import type { PropsWithChildren } from "react";
import { View } from "react-native";

type ContentContainerProps = PropsWithChildren<{ className?: string }>;

export default function ContentContainer({
  children,
  className
}: ContentContainerProps) {
  return (
    <View
      className={["px-6", className ?? ""].filter(Boolean).join(" ")}
    >
      {children}
    </View>
  );
}
