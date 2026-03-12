import { TextInput, View, Text } from "react-native";

type InputProps = {
  label: string;
  value: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  onChangeText: (value: string) => void;
};

export default function Input({
  label,
  value,
  placeholder,
  secureTextEntry,
  onChangeText
}: InputProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm text-brand-muted">{label}</Text>
      <TextInput
        className="rounded-xl border border-brand-slate bg-brand-night px-4 py-3 text-white"
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}
