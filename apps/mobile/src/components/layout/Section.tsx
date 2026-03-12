import type { PropsWithChildren } from "react";
import { View, Text } from "react-native";

type SectionProps = PropsWithChildren<{ title?: string; className?: string }>;

export default function Section({ title, className, children }: SectionProps) {
  return (
    <View className={["gap-3", className ?? ""].filter(Boolean).join(" ")}>
      {title ? (
        <Text className="text-base font-semibold text-white">{title}</Text>
      ) : null}
      {children}
    </View>
  );
}
