import { Text, View } from "react-native";
import type { PaymentRecord } from "../../types/payment.types";

type PaymentItemProps = {
  payment: PaymentRecord;
};

export default function PaymentItem({ payment }: PaymentItemProps) {
  return (
    <View className="rounded-xl border border-brand-slate bg-brand-night p-4">
      <Text className="text-base font-semibold text-white">
        Payment #{payment.id}
      </Text>
      <Text className="mt-2 text-sm text-brand-muted">
        Status: {payment.status}
      </Text>
      <Text className="text-sm text-brand-muted">Amount: {payment.amount}</Text>
    </View>
  );
}
