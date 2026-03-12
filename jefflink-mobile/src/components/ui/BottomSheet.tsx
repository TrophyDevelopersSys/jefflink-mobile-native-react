import { Pressable, Text, View } from "react-native";
import Modal from "./Modal";

type BottomSheetProps = {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function BottomSheet({
  visible,
  title,
  onClose,
  children
}: BottomSheetProps) {
  return (
    <Modal visible={visible} onClose={onClose}>
      <View className="gap-4">
        {title ? (
          <Text className="text-base font-semibold text-white">{title}</Text>
        ) : null}
        <View>{children}</View>
        <Pressable onPress={onClose} className="rounded-[48px] bg-brand-slate p-3">
          <Text className="text-center text-sm text-white">Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
}
