import { Pressable, Text } from "react-native";

type ButtonVariant = "primary" | "ghost" | "danger";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-brand-accent",
  ghost: "bg-transparent border border-brand-slate",
  danger: "bg-brand-danger"
};

export default function Button({
  label,
  onPress,
  variant = "primary",
  disabled
}: ButtonProps) {
  const containerClass = [
    "w-full rounded-[48px] px-4 py-3",
    variantStyles[variant],
    disabled ? "opacity-50" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Pressable
      className={containerClass}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className="text-center text-base font-semibold text-white">
        {label}
      </Text>
    </Pressable>
  );
}
