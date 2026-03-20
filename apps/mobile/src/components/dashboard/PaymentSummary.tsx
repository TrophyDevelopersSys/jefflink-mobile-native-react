import React from "react";
import { View, Text, Pressable } from "react-native";
import { Wallet, Clock, History } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../theme/useTheme";
import { navigateToCustomerTab } from "../../navigation/navigationHelpers";

const transactions = [
  { label: "Ad Boost — Toyota Harrier", amount: "-UGX 30,000",  date: "Mar 4", type: "debit"  },
  { label: "Listing Fee",               amount: "-UGX 20,000",  date: "Mar 2", type: "debit"  },
  { label: "Wallet Top-up",             amount: "+UGX 100,000", date: "Mar 1", type: "credit" },
];

export default function PaymentSummary() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <View className="mt-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-white text-base font-semibold">Payments</Text>
        <Pressable onPress={() => navigateToCustomerTab(navigation, "Payments")}>
          <Text className="text-brand-accent text-sm">View All</Text>
        </Pressable>
      </View>

      {/* Balance cards */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1 bg-brand-primary/20 border border-brand-primary/30 rounded-xl p-4">
          <View className="flex-row items-center gap-1 mb-1">
            <Wallet size={13} color="#22C55E" strokeWidth={1.8} />
            <Text className="text-brand-muted text-xs">Wallet Balance</Text>
          </View>
          <Text className="text-white font-bold text-base">UGX 250,000</Text>
        </View>
        <View className="flex-1 bg-brand-warning/10 border border-brand-warning/30 rounded-xl p-4">
          <View className="flex-row items-center gap-1 mb-1">
            <Clock size={13} color="#F59E0B" strokeWidth={1.8} />
            <Text className="text-brand-muted text-xs">Pending Ads</Text>
          </View>
          <Text className="text-brand-warning font-bold text-base">UGX 50,000</Text>
        </View>
      </View>

      {/* Transaction list */}
      <View className="bg-brand-slate rounded-xl overflow-hidden">
        <View className="flex-row items-center gap-2 px-4 py-3 border-b border-white/5">
          <History size={13} color={theme.textMuted} strokeWidth={1.8} />
          <Text className="text-brand-muted text-xs">Recent Transactions</Text>
        </View>
        {transactions.map((tx, i) => (
          <View
            key={i}
            className={`flex-row items-center justify-between px-4 py-3 ${
              i < transactions.length - 1 ? "border-b border-white/5" : ""
            }`}
          >
            <View className="flex-1 mr-4">
              <Text className="text-white text-xs font-medium">{tx.label}</Text>
              <Text className="text-brand-muted text-xs mt-0.5">{tx.date}</Text>
            </View>
            <Text
              className={`text-sm font-semibold ${
                tx.type === "credit" ? "text-brand-accent" : "text-brand-danger"
              }`}
            >
              {tx.amount}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
