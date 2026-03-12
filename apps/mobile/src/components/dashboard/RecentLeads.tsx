import React from "react";
import { View, Text, Pressable } from "react-native";
import { MessageCircle, Phone } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../theme/useTheme";

const leads = [
  { name: "John K",   initials: "JK", listing: "Toyota Harrier",  time: "2h ago"   },
  { name: "Sarah M",  initials: "SM", listing: "Subaru Forester",  time: "5h ago"   },
  { name: "David O",  initials: "DO", listing: "Toyota RAV4",      time: "Yesterday" },
];

export default function RecentLeads() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <View className="mt-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-white text-base font-semibold">Recent Leads</Text>
        <Pressable onPress={() => navigation.navigate("VendorLeads" as never)}>
          <Text className="text-brand-accent text-sm">View All</Text>
        </Pressable>
      </View>

      {leads.map((lead, i) => (
        <View key={i} className="bg-brand-slate p-4 rounded-xl mb-3">
          {/* Lead info row */}
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-brand-primary items-center justify-center">
              <Text className="text-white text-sm font-bold">{lead.initials}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-sm">{lead.name}</Text>
              <Text className="text-brand-muted text-xs mt-0.5">
                Interested in {lead.listing}
              </Text>
            </View>
            <Text className="text-brand-muted text-xs">{lead.time}</Text>
          </View>

          {/* Action buttons */}
          <View className="flex-row gap-2 mt-3">
            <Pressable className="flex-1 flex-row items-center justify-center gap-1 bg-brand-accent/10 border border-brand-accent/30 py-2 rounded-lg active:opacity-70">
              <MessageCircle size={14} color={theme.accent} strokeWidth={1.8} />
              <Text className="text-brand-accent text-xs font-semibold">Message</Text>
            </Pressable>
            <Pressable className="flex-1 flex-row items-center justify-center gap-1 bg-brand-primary/10 border border-brand-primary/30 py-2 rounded-lg active:opacity-70">
              <Phone size={14} color="#0E7C3A" strokeWidth={1.8} />
              <Text style={{ color: "#0E7C3A" }} className="text-xs font-semibold">Call</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}
