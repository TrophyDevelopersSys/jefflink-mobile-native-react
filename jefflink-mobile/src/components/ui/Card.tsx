import { View } from "react-native";
import type { PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{ className?: string }>;

export default function Card({ children, className }: CardProps) {
  return (
    <View
      className={[
        "rounded-2xl border border-brand-slate bg-brand-night p-4",
        className ?? ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </View>
  );
}
