import { Text, View } from "react-native";

type StepperProps = {
  total: number;
  current: number;
};

export default function Stepper({ total, current }: StepperProps) {
  return (
    <View className="flex-row items-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          className={[
            "h-1.5 flex-1 rounded-full",
            index < current ? "bg-brand-accent" : "bg-brand-slate"
          ]
            .filter(Boolean)
            .join(" ")}
        />
      ))}
      <Text className="text-xs text-brand-muted">
        {current}/{total}
      </Text>
    </View>
  );
}
