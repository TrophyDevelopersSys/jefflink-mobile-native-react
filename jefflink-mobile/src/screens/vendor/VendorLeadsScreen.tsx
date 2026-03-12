import React from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { MessageCircle, Phone } from "lucide-react-native";
import AppChrome from "../../components/layout/AppChrome";
import { useTheme } from "../../theme/useTheme";

const allLeads = [
  { name: "John K",   initials: "JK", listing: "Toyota Harrier",    time: "2h ago",    status: "New"     },
  { name: "Sarah M",  initials: "SM", listing: "Subaru Forester",   time: "5h ago",    status: "New"     },
  { name: "David O",  initials: "DO", listing: "Toyota RAV4",       time: "Yesterday", status: "Replied" },
  { name: "Grace N",  initials: "GN", listing: "Honda CRV",         time: "2 days ago", status: "Replied" },
  { name: "Peter A",  initials: "PA", listing: "Nissan X-Trail",    time: "3 days ago", status: "Closed"  },
  { name: "Alice W",  initials: "AW", listing: "Toyota Prado",      time: "4 days ago", status: "Closed"  },
];

const statusStyle: Record<string, { bg: string; text: string }> = {
  New:     { bg: "bg-brand-accent/10",  text: "text-brand-accent"  },
  Replied: { bg: "bg-brand-warning/10", text: "text-brand-warning" },
  Closed:  { bg: "bg-brand-muted/10",   text: "text-brand-muted"   },
};

export default function VendorLeadsScreen() {
  const { theme } = useTheme();

  return (
    <AppChrome title="All Leads" activeKey="home" variant="vendor" showBottomNav={false}>
      <ScrollView
        className="flex-1 bg-brand-night"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white text-lg font-bold">All Leads</Text>
          <View className="bg-brand-primary/20 border border-brand-primary/30 px-3 py-1 rounded-full">
            <Text className="text-brand-accent text-xs font-semibold">
              {allLeads.length} total
            </Text>
          </View>
        </View>

        {allLeads.map((lead, i) => {
          const style = statusStyle[lead.status] ?? statusStyle.Replied;
          return (
            <View key={i} className="bg-brand-slate p-4 rounded-xl mb-3">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-10 h-10 rounded-full bg-brand-primary items-center justify-center shrink-0">
                  <Text className="text-white text-sm font-bold">{lead.initials}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-sm">{lead.name}</Text>
                  <Text className="text-brand-muted text-xs mt-0.5">
                    Interested in {lead.listing}
                  </Text>
                </View>
                <View className="items-end gap-1">
                  <View className={`px-2 py-0.5 rounded-full ${style.bg}`}>
                    <Text className={`text-xs font-medium ${style.text}`}>{lead.status}</Text>
                  </View>
                  <Text className="text-brand-muted text-xs">{lead.time}</Text>
                </View>
              </View>

              <View className="flex-row gap-2">
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
          );
        })}
      </ScrollView>
    </AppChrome>
  );
}
