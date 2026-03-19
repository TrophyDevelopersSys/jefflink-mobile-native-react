import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import HeroCarousel from "../../components/hero/HeroCarousel";
import AppChrome from "../../components/layout/AppChrome";
import GlobalSearchBar from "../../components/search/GlobalSearchBar";
import ListingCarousel from "../../components/sections/ListingCarousel";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";
import FeaturedListingsCarousel from "../../components/feed/FeaturedListingsCarousel";

import { useGlobalSearch } from "../../features/search/search.hooks";

// ── FeedHeader lives at module level so it always receives the SAME
// component reference — prevents Netflix-style header unmount/remount on
// Android when the parent HomeScreen re-renders.
const FeedHeader = React.memo(function FeedHeader() {
  const { query, setQuery } = useGlobalSearch();

  return (
    <>
      <ErrorBoundary name="HeroCarousel">
        <HeroCarousel />
      </ErrorBoundary>

      <ErrorBoundary name="GlobalSearchBar">
        <GlobalSearchBar value={query} onChangeText={setQuery} />
      </ErrorBoundary>

      <ErrorBoundary name="ListingCarousel-Cars">
        <ListingCarousel title="Cars For Sale" type="cars" />
      </ErrorBoundary>

      <ErrorBoundary name="ListingCarousel-Land">
        <ListingCarousel title="Land For Sale" type="land" />
      </ErrorBoundary>

      <ErrorBoundary name="ListingCarousel-Vendors">
        <ListingCarousel title="Vendors on JeffLink" type="vendors" />
      </ErrorBoundary>

      <FeaturedListingsCarousel />
    </>
  );
});

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const goToHirePurchase = () => {
    const parent = navigation.getParent?.();
    if (parent?.navigate) {
      parent.navigate("HirePurchaseApplication");
      return;
    }
    navigation.navigate("HirePurchaseApplication");
  };

  return (
    <AppChrome
      title="Home"
      activeKey="home"
      variant="customer"
      showBottomNav={false}
      className="bg-white dark:bg-[#0F1115]"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <FeedHeader />
        <View className="mx-6 mt-6 rounded-2xl border border-brand-slate bg-brand-night p-5">
          <Text className="text-lg font-semibold text-white">Need Hire Purchase Financing?</Text>
          <Text className="mt-1 text-sm text-brand-muted">
            Start your JeffLink application form and review the full agreement terms.
          </Text>
          <Pressable
            onPress={goToHirePurchase}
            className="mt-4 self-start rounded-full bg-brand-accent px-5 py-2.5"
          >
            <Text className="text-sm font-semibold text-black">Open Application</Text>
          </Pressable>
        </View>
      </ScrollView>
    </AppChrome>
  );
}
