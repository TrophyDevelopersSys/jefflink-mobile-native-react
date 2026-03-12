import { View } from "react-native";

type SkeletonProps = {
  className?: string;
};

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <View
      className={["h-4 w-full rounded bg-brand-slate/60", className ?? ""]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
