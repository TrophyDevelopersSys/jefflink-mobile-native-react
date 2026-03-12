import type { PropsWithChildren } from "react";
import { View } from "react-native";

type BottomSheetWrapperProps = PropsWithChildren<{ className?: string }>;

export default function BottomSheetWrapper({
  children,
  className
}: BottomSheetWrapperProps) {
  return (
    <View
      className={[
        "rounded-t-3xl border border-brand-slate bg-brand-night p-6",
        className ?? ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </View>
  );
}
