import { Pressable, Text, View } from "react-native";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function Pagination({
  page,
  totalPages,
  onPrev,
  onNext
}: PaginationProps) {
  return (
    <View className="flex-row items-center justify-between gap-4">
      <Pressable
        className="flex-1 rounded-xl border border-brand-slate px-3 py-2"
        onPress={onPrev}
      >
        <Text className="text-center text-sm text-white">Prev</Text>
      </Pressable>
      <Text className="text-xs text-brand-muted">
        {page} / {totalPages}
      </Text>
      <Pressable
        className="flex-1 rounded-xl border border-brand-slate px-3 py-2"
        onPress={onNext}
      >
        <Text className="text-center text-sm text-white">Next</Text>
      </Pressable>
    </View>
  );
}
