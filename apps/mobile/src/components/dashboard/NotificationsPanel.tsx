import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { CheckCircle2, AlertTriangle, Bell } from "lucide-react-native";

type NotifType = "success" | "warning" | "info";

interface Notification {
  id: number;
  message: string;
  time: string;
  type: NotifType;
  read: boolean;
}

const seed: Notification[] = [
  {
    id: 1,
    message: "Your listing Toyota Harrier was approved",
    time: "1h ago",
    type: "success",
    read: false,
  },
  {
    id: 2,
    message: "Your ad promotion expires tomorrow",
    time: "3h ago",
    type: "warning",
    read: false,
  },
  {
    id: 3,
    message: "New message from John K about Subaru Forester",
    time: "5h ago",
    type: "info",
    read: true,
  },
];

function NotifIcon({ type }: { type: NotifType }) {
  if (type === "success") return <CheckCircle2 size={15} color="#22C55E" strokeWidth={1.8} />;
  if (type === "warning") return <AlertTriangle size={15} color="#F59E0B" strokeWidth={1.8} />;
  return <Bell size={15} color="#9AA3AF" strokeWidth={1.8} />;
}

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>(seed);

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <View className="mt-6 mb-8">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-white text-base font-semibold">Notifications</Text>
          {unread > 0 && (
            <View className="bg-brand-danger rounded-full px-2 py-0.5">
              <Text className="text-white text-xs font-bold">{unread}</Text>
            </View>
          )}
        </View>
        {unread > 0 && (
          <Pressable onPress={markAllRead} className="active:opacity-70">
            <Text className="text-brand-accent text-sm">Mark all read</Text>
          </Pressable>
        )}
      </View>

      <View className="bg-brand-slate rounded-xl overflow-hidden">
        {notifications.map((note, i) => (
          <View
            key={note.id}
            className={[
              "flex-row items-start gap-3 px-4 py-3",
              !note.read ? "bg-brand-primary/10" : "",
              i < notifications.length - 1 ? "border-b border-white/5" : "",
            ].join(" ")}
          >
            <View className="mt-0.5">
              <NotifIcon type={note.type} />
            </View>
            <View className="flex-1">
              <Text className={`text-sm ${note.read ? "text-brand-muted" : "text-white"}`}>
                {note.message}
              </Text>
              <Text className="text-brand-muted text-xs mt-1">{note.time}</Text>
            </View>
            {!note.read && (
              <View className="w-2 h-2 bg-brand-accent rounded-full mt-1.5 shrink-0" />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
