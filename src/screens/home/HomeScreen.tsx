import React from "react";
import { ScrollView } from "react-native";

import HeroCarousel from "../../components/hero/HeroCarousel";
import AppChrome from "../../components/layout/AppChrome";
import SearchFilterBar from "../../components/search/SearchFilterBar";
import ListingCarousel from "../../components/sections/ListingCarousel";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";
import FeaturedListingsCarousel from "../../components/feed/FeaturedListingsCarousel";

// ── FeedHeader lives at module level so it always receives the SAME
// component reference — prevents Netflix-style header unmount/remount on
// Android when the parent HomeScreen re-renders.
const FeedHeader = React.memo(function FeedHeader() {
  return (
    <>
      <ErrorBoundary name="HeroCarousel">
        <HeroCarousel />
      </ErrorBoundary>

      <ErrorBoundary name="GlobalSearchBar">
        <SearchFilterBar />
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
      </ScrollView>
    </AppChrome>
  );
}