import { ActivityIndicator, View } from "react-native";

type SpinnerProps = {
  size?: "small" | "large";
};

export default function Spinner({ size = "small" }: SpinnerProps) {
  return (
    <View className="items-center justify-center">
      <ActivityIndicator size={size} color="#22C55E" />
    </View>
  );
}
