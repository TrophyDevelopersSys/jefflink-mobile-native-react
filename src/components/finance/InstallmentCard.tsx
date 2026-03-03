import { Text, View } from "react-native";
import type { Installment } from "../../types/payment.types";

type InstallmentCardProps = {
  installment: Installment;
};

export default function InstallmentCard({
  installment
}: InstallmentCardProps) {
  return (
    <View className="rounded-xl border border-brand-slate bg-brand-night p-4">
      <Text className="text-base font-semibold text-white">
        Installment {installment.id}
      </Text>
      <Text className="mt-2 text-sm text-brand-muted">
        Due: {installment.dueDate}
      </Text>
      <Text className="text-sm text-brand-muted">
        Status: {installment.status}
      </Text>
      <Text className="text-sm text-brand-muted">
        Amount: {installment.amount}
      </Text>
    </View>
  );
}
