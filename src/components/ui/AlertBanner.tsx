import { Text, View } from "react-native";

type AlertBannerProps = {
  message: string;
  tone?: "success" | "warning" | "error";
};

const toneStyles = {
  success: "border-brand-accent bg-brand-accent/15",
  warning: "border-brand-warning bg-brand-warning/15",
  error: "border-brand-danger bg-brand-danger/15"
};

export default function AlertBanner({
  message,
  tone = "success"
}: AlertBannerProps) {
  return (
    <View
      className={[
        "rounded-2xl border px-4 py-3",
        toneStyles[tone]
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Text className="text-sm text-white">{message}</Text>
    </View>
  );
}
