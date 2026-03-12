import { View } from "react-native";

type DividerProps = {
  className?: string;
};

export default function Divider({ className }: DividerProps) {
  return (
    <View
      className={["h-px w-full bg-brand-slate", className ?? ""]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
