import type { PropsWithChildren } from "react";
import { View } from "react-native";

type FixedCTAContainerProps = PropsWithChildren<{ className?: string }>;

export default function FixedCTAContainer({
  children,
  className
}: FixedCTAContainerProps) {
  return (
    <View
      className={[
        "border-t border-brand-slate bg-brand-night px-6 py-4",
        className ?? ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </View>
  );
}
