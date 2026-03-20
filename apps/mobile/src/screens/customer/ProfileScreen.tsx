import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  Car,
  Tag,
  ClipboardList,
  MessageSquare,
  FileText,
  User,
  Bell,
  CreditCard,
  History,
  ChevronRight,
  LogOut,
  BadgeCheck,
  Sun,
  Moon,
  Monitor,
} from "lucide-react-native";
import AppChrome from "../../components/layout/AppChrome";
import Avatar from "../../components/ui/Avatar";
import Divider from "../../components/ui/Divider";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../theme/useTheme";
import { useNavigation } from "@react-navigation/native";
import type { ThemePreference } from "../../theme/useTheme";
import { navigateToCustomerTab } from "../../navigation/navigationHelpers";

type MenuItem = {
  id: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  description: string;
  onPress: () => void;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

function MenuRow({
  icon: Icon,
  label,
  description,
  onPress,
  showDivider = true,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  description: string;
  onPress: () => void;
  showDivider?: boolean;
}) {
  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        className="flex-row items-center gap-3 py-3"
      >
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-brand-slate">
          <Icon size={18} color="#22C55E" />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-sm font-semibold text-white">{label}</Text>
          <Text className="text-xs text-brand-muted">{description}</Text>
        </View>
        <ChevronRight size={16} color="#9AA3AF" />
      </TouchableOpacity>
      {showDivider && <Divider />}
    </>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { preference, setPreference } = useTheme();
  const navigation = useNavigation<any>();

  const appearanceOptions: { label: string; value: ThemePreference; Icon: any }[] = [
    { label: "System", value: "system", Icon: Monitor },
    { label: "Light",  value: "light",  Icon: Sun },
    { label: "Dark",   value: "dark",   Icon: Moon },
  ];

  const sections: MenuSection[] = [
    {
      title: "Buying & Selling",
      items: [
        {
          id: "vehicles-own",
          icon: Car,
          label: "Vehicles you own",
          description: "Set MOT and service reminders and track your vehicle's value",
          onPress: () => navigation.navigate("MyVehicles" as never),
        },
        {
          id: "vehicles-selling",
          icon: Tag,
          label: "Vehicles you're selling",
          description: "Create, edit and manage your ads",
          onPress: () => navigateToCustomerTab(navigation, "Listings"),
        },
        {
          id: "vehicle-checks",
          icon: ClipboardList,
          label: "Your vehicle checks",
          description: "View your vehicle history reports and run a new vehicle check",
          onPress: () => {},
        },
        {
          id: "enquiries",
          icon: MessageSquare,
          label: "Enquiries, deals and reservations",
          description: "View and continue your enquiries, deals and reservations",
          onPress: () => {},
        },
        {
          id: "leasing",
          icon: FileText,
          label: "Leasing applications",
          description: "View your application details and continue started applications",
          onPress: () => {},
        },
      ],
    },
    {
      title: "Account Settings",
      items: [
        {
          id: "personal-details",
          icon: User,
          label: "Personal details",
          description: "Update your personal and contact details",
          onPress: () => {},
        },
        {
          id: "subscriptions",
          icon: Bell,
          label: "Subscriptions",
          description: "Manage what emails and notifications you receive",
          onPress: () => {},
        },
      ],
    },
    {
      title: "Payment Details",
      items: [
        {
          id: "payment-history",
          icon: History,
          label: "Payment history",
          description: "See your advert and payment history",
          onPress: () => navigateToCustomerTab(navigation, "Payments"),
        },
        {
          id: "payment-methods",
          icon: CreditCard,
          label: "Payment methods",
          description: "Update and manage your payment methods",
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <AppChrome
      title="Profile"
      activeKey="profile"
      variant="customer"
      showBottomNav={false}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-5 px-4 pt-4 pb-10"
      >
        {/* ── User identity card ── */}
        <View className="flex-row items-center gap-4 rounded-2xl border border-brand-slate bg-brand-night p-4">
          <Avatar initials={(user?.fullName ?? "User").slice(0, 2).toUpperCase()} />
          <View className="flex-1 gap-0.5">
            <Text className="text-base font-semibold text-white">
              {user?.fullName ?? "User"}
            </Text>
            <Text className="text-sm text-brand-muted">{user?.email ?? "—"}</Text>
          </View>
          <View className="flex-row items-center gap-1 rounded-full bg-brand-accent/10 px-2.5 py-1">
            <BadgeCheck size={13} color="#22C55E" />
            <Text className="text-xs font-semibold text-brand-accent">Verified</Text>
          </View>
        </View>

        {/* ── Your account label ── */}
        <Text className="px-1 text-xs font-semibold uppercase tracking-widest text-brand-muted">
          Your account
        </Text>

        {/* ── Menu sections ── */}
        {sections.map((section) => (
          <View key={section.title} className="gap-2">
            <Text className="px-1 text-xs font-semibold uppercase tracking-widest text-brand-muted">
              {section.title}
            </Text>
            <View className="rounded-2xl border border-brand-slate bg-brand-night px-4">
              {section.items.map((item, index) => (
                <MenuRow
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  description={item.description}
                  onPress={item.onPress}
                  showDivider={index < section.items.length - 1}
                />
              ))}
            </View>
          </View>
        ))}

        {/* ── Appearance ── */}
        <View className="gap-2">
          <Text className="px-1 text-xs font-semibold uppercase tracking-widest text-brand-muted">
            Appearance
          </Text>
          <View className="flex-row gap-3">
            {appearanceOptions.map(({ label, value, Icon }) => {
              const active = preference === value;
              return (
                <TouchableOpacity
                  key={value}
                  activeOpacity={0.75}
                  onPress={() => setPreference(value)}
                  className={[
                    "flex-1 items-center gap-2 rounded-2xl border py-4",
                    active
                      ? "border-brand-accent bg-brand-accent/10"
                      : "border-brand-slate bg-brand-night",
                  ].join(" ")}
                >
                  <Icon size={20} color={active ? "#22C55E" : "#9AA3AF"} />
                  <Text
                    className={[
                      "text-xs font-semibold",
                      active ? "text-brand-accent" : "text-brand-muted",
                    ].join(" ")}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Sign out ── */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={signOut}
          className="flex-row items-center justify-center gap-2 rounded-[48px] border border-brand-danger/40 bg-brand-danger/10 py-4"
        >
          <LogOut size={18} color="#DC2626" />
          <Text className="text-sm font-semibold text-brand-danger">Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </AppChrome>
  );
}
