import type { PropsWithChildren } from "react";
import { ScrollView } from "react-native";

type ScrollContainerProps = PropsWithChildren<{ className?: string }>;

export default function ScrollContainer({
  children,
  className
}: ScrollContainerProps) {
  return (
    <ScrollView contentContainerClassName={className ?? ""}>
      {children}
    </ScrollView>
  );
}
