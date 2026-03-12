import React, { memo, useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChevronRight,
  FileText,
  HelpCircle,
  Info,
  Mail,
  Settings,
  X,
  type LucideProps
} from "lucide-react-native";

export type DrawerItemKey =
  | "about"
  | "help"
  | "contact"
  | "terms"
  | "settings";

type DrawerMenuProps = {
  visible: boolean;
  onClose: () => void;
  onItemPress?: (item: DrawerItemKey) => void;
};

const DRAWER_WIDTH = Dimensions.get("window").width * 0.72;

const drawerItems: Array<{
  key: DrawerItemKey;
  label: string;
  Icon: React.ComponentType<LucideProps>;
}> = [
  { key: "about",    label: "About JeffLink",  Icon: Info       },
  { key: "help",     label: "Help & Support",  Icon: HelpCircle },
  { key: "contact",  label: "Contact Us",      Icon: Mail       },
  { key: "terms",    label: "Terms & Privacy", Icon: FileText   },
  { key: "settings", label: "Settings",        Icon: Settings   }
];

// Memoized single drawer row — stable reference, skips re-render when parent updates.
const DrawerRow = memo(function DrawerRow({
  item,
  onItemPress,
  onClose
}: {
  item: typeof drawerItems[number];
  onItemPress?: (key: DrawerItemKey) => void;
  onClose: () => void;
}) {
  const Icon = item.Icon;
  const handlePress = useCallback(() => {
    onItemPress?.(item.key);
    onClose();
  }, [item.key, onItemPress, onClose]);

  return (
    <TouchableOpacity
      key={item.key}
      activeOpacity={0.75}
      onPress={handlePress}
      style={styles.row}
    >
      <View style={styles.iconBox}>
        <Icon size={18} color="#22C55E" />
      </View>
      <Text style={styles.rowLabel}>{item.label}</Text>
      <ChevronRight size={16} color="#4B5563" />
    </TouchableOpacity>
  );
});

export default function DrawerMenu({ visible, onClose, onItemPress }: DrawerMenuProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0,            duration: 260, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 1,            duration: 220, useNativeDriver: true })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: DRAWER_WIDTH, duration: 220, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 0,            duration: 180, useNativeDriver: true })
      ]).start();
    }
  }, [visible]);

  return (
    // hardwareAccelerated: true prevents Android from re-compositing the full
    // screen on every animation frame, which was the main source of the delay.
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      hardwareAccelerated
    >
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={styles.backdropTap} onPress={onClose} />

        <Animated.View
          style={[
            styles.panel,
            {
              paddingTop: insets.top,
              paddingBottom: insets.bottom + 16,
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>JeffLink</Text>
            <TouchableOpacity activeOpacity={0.75} onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#9AA3AF" />
            </TouchableOpacity>
          </View>

          {/* Nav items */}
          <View style={styles.navList}>
            {drawerItems.map((item) => (
              <DrawerRow
                key={item.key}
                item={item}
                onItemPress={onItemPress}
                onClose={onClose}
              />
            ))}
          </View>

          {/* Footer */}
          <View style={[styles.footer, { bottom: insets.bottom + 20 }]}>
            <Text style={styles.footerText}>JeffLink Marketplace · v1.0.0</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    flexDirection: "row"
  },
  backdropTap: { flex: 1 },
  panel: {
    width: DRAWER_WIDTH,
    backgroundColor: "#13161C",
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 20
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1D23"
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3
  },
  closeBtn: {
    backgroundColor: "#1A1D23",
    borderRadius: 20,
    padding: 6
  },
  navList: {
    marginTop: 12,
    paddingHorizontal: 12
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 2
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#1A1D23",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },
  rowLabel: {
    flex: 1,
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "500"
  },
  footer: {
    position: "absolute",
    left: 20,
    right: 20
  },
  footerText: {
    color: "#4B5563",
    fontSize: 11,
    textAlign: "center"
  }
});
