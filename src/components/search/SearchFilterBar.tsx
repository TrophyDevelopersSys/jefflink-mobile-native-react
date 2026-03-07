import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CustomerTabParamList } from "../../navigation/CustomerNavigator";

import { colors } from "../../constants/colors";
import { useTheme } from "../../theme/useTheme";
import { useSearchFilters } from "../../features/search/search.hooks";
import {
  PRICE_RANGES,
  type Location,
  type PriceRange,
  type PropertyType,
  type SellerType,
} from "../../features/search/search.service";

// ─── Option data ────────────────────────────────────────────────────────────

const PROPERTY_TYPES: { label: string; value: PropertyType }[] = [
  { label: "Cars", value: "cars" },
  { label: "Land", value: "land" },
  { label: "Houses", value: "houses" },
  { label: "Commercial Property", value: "commercial" },
  { label: "Land for Lease", value: "land-lease" },
];

const SELLER_TYPES: { label: string; value: SellerType }[] = [
  { label: "All Listings", value: "all" },
  { label: "JeffLink Verified ✓", value: "verified" },
  { label: "Vendor / Dealer", value: "vendor" },
  { label: "Private Seller", value: "private" },
];

const LOCATIONS: { label: string; value: Location }[] = [
  { label: "Kampala", value: "kampala" },
  { label: "Mukono", value: "mukono" },
  { label: "Wakiso", value: "wakiso" },
  { label: "Entebbe", value: "entebbe" },
  { label: "Jinja", value: "jinja" },
  { label: "Mbarara", value: "mbarara" },
  { label: "Gulu", value: "gulu" },
  { label: "Mbale", value: "mbale" },
  { label: "Masaka", value: "masaka" },
];

// ─── FilterPill – tappable pill that opens a bottom-sheet modal ──────────────

type OptionItem = { label: string; value: string };

function FilterPill({
  placeholder,
  selected,
  options,
  onSelect,
  onClear,
  isDark,
}: {
  placeholder: string;
  selected: string | null;
  options: OptionItem[];
  onSelect: (value: string) => void;
  onClear?: () => void;
  isDark: boolean;
}) {
  const [open, setOpen] = useState(false);
  const isActive = !!selected;

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.85}
        style={[
          styles.pill,
          {
            backgroundColor: isActive
              ? colors.brandAccent + "22"
              : isDark ? colors.brandSlate : "#F1F5F9",
            borderColor: isActive ? colors.brandAccent : isDark ? colors.brandSlate : "#CBD5E1",
          },
        ]}
      >
        <Text
          style={[
            styles.pillText,
            { color: isActive ? colors.brandAccent : colors.brandMuted },
          ]}
          numberOfLines={1}
        >
          {selected ?? placeholder}
        </Text>
        {isActive && onClear ? (
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); onClear(); }}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <X size={13} color={colors.brandAccent} />
          </TouchableOpacity>
        ) : (
          <ChevronDown size={14} color={isActive ? colors.brandAccent : colors.brandMuted} />
        )}
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={[styles.sheet, { backgroundColor: isDark ? colors.brandNight : "#FFFFFF" }]}>
          <View style={styles.sheetHandle} />
          <Text style={[styles.sheetTitle, { color: isDark ? colors.white : "#0F172A" }]}>
            {placeholder}
          </Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((opt) => {
              const active = opt.label === selected || opt.value === selected;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => { onSelect(opt.label); setOpen(false); }}
                  style={[
                    styles.sheetOption,
                    active && { backgroundColor: colors.brandAccent + "18" },
                  ]}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.sheetOptionText,
                      { color: active ? colors.brandAccent : isDark ? colors.white : "#0F172A" },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {active && (
                    <View style={styles.activeDot} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

// ─── SearchFilterBar ─────────────────────────────────────────────────────────

export default function SearchFilterBar() {
  const { isDark } = useTheme();
  const navigation = useNavigation<BottomTabNavigationProp<CustomerTabParamList>>();
  const { filters, setFilter, queryString } = useSearchFilters();

  // Derive price ranges from selected property type
  const priceOptions: OptionItem[] = (
    filters.propertyType ? PRICE_RANGES[filters.propertyType] : PRICE_RANGES.cars
  ).map((r) => ({ label: r.label, value: r.label }));

  function handleSearch() {
    const params = new URLSearchParams(queryString);
    navigation.navigate("Listings", {
      propertyType: filters.propertyType ?? undefined,
      seller: filters.seller !== "all" ? filters.seller : undefined,
      location: filters.location ?? undefined,
      priceMin: params.get("priceMin") ? Number(params.get("priceMin")) : undefined,
      priceMax: params.get("priceMax") ? Number(params.get("priceMax")) : undefined,
    });
  }

  const cardBg = isDark ? colors.brandSlate : "#F8FAFC";
  const borderColor = isDark ? "#2A2F38" : "#E2E8F0";

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      {/* Row 1: Property Type + Seller */}
      <View style={styles.row}>
        <View style={styles.half}>
          <FilterPill
            placeholder="Property Type"
            selected={
              filters.propertyType
                ? PROPERTY_TYPES.find((p) => p.value === filters.propertyType)?.label ?? null
                : null
            }
            options={PROPERTY_TYPES}
            onSelect={(label) => {
              const found = PROPERTY_TYPES.find((p) => p.label === label);
              if (found) setFilter("propertyType", found.value);
            }}
            onClear={() => setFilter("propertyType", null)}
            isDark={isDark}
          />
        </View>
        <View style={styles.half}>
          <FilterPill
            placeholder="Seller"
            selected={filters.seller !== "all"
              ? SELLER_TYPES.find((s) => s.value === filters.seller)?.label ?? null
              : null
            }
            options={SELLER_TYPES}
            onSelect={(label) => {
              const found = SELLER_TYPES.find((s) => s.label === label);
              if (found) setFilter("seller", found.value);
            }}
            onClear={() => setFilter("seller", "all")}
            isDark={isDark}
          />
        </View>
      </View>

      {/* Row 2: Price + Location */}
      <View style={styles.row}>
        <View style={styles.half}>
          <FilterPill
            placeholder="Price"
            selected={filters.priceRange?.label ?? null}
            options={priceOptions}
            onSelect={(label) => {
              const src = filters.propertyType ? PRICE_RANGES[filters.propertyType] : PRICE_RANGES.cars;
              const found = src.find((r: PriceRange) => r.label === label);
              setFilter("priceRange", found ?? null);
            }}
            onClear={() => setFilter("priceRange", null)}
            isDark={isDark}
          />
        </View>
        <View style={styles.half}>
          <FilterPill
            placeholder="Location"
            selected={
              filters.location
                ? LOCATIONS.find((l) => l.value === filters.location)?.label ?? null
                : null
            }
            options={LOCATIONS}
            onSelect={(label) => {
              const found = LOCATIONS.find((l) => l.label === label);
              if (found) setFilter("location", found.value);
            }}
            onClear={() => setFilter("location", null)}
            isDark={isDark}
          />
        </View>
      </View>

      {/* Search button */}
      <TouchableOpacity
        onPress={handleSearch}
        activeOpacity={0.88}
        style={styles.searchBtn}
        accessibilityRole="button"
        accessibilityLabel="Search listings"
      >
        <Search size={18} color="#000" />
        <Text style={styles.searchBtnText}>Search</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  half: {
    flex: 1,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  pillText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },
  searchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandAccent,
    borderRadius: 12,
    paddingVertical: 13,
    gap: 8,
    marginTop: 2,
  },
  searchBtnText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 15,
  },
  // Modal sheet
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 36,
    maxHeight: "70%",
    paddingHorizontal: 16,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#4A5568",
    marginTop: 10,
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 2,
  },
  sheetOptionText: {
    fontSize: 15,
    fontWeight: "500",
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brandAccent,
  },
});
