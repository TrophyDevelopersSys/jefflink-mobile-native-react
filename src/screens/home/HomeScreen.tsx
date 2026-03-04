import React from "react";
import { ScrollView, View } from "react-native";

import AdBanner from "../../components/ads/AdBanner";
import HeroCarousel from "../../components/hero/HeroCarousel";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import BottomNav from "../../components/navigation/BottomNav";
import TopBar from "../../components/navigation/TopBar";
import GlobalSearchBar from "../../components/search/GlobalSearchBar";
import ListingCarousel from "../../components/sections/ListingCarousel";
import { useGlobalSearch } from "../../features/search/search.hooks";

export default function HomeScreen() {
  const { query, setQuery } = useGlobalSearch();

  return (
    <ScreenWrapper className="bg-brand-dark">
      <View className="flex-1">
        <TopBar title="Home" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <GlobalSearchBar value={query} onChangeText={setQuery} />
          <HeroCarousel />
          <AdBanner />

          <ListingCarousel title="Cars For Sale" type="cars" />
          <ListingCarousel title="Land For Sale" type="land" />
          <ListingCarousel title="Vendors on JeffLink" type="vendors" />
        </ScrollView>

        <BottomNav activeKey="home" />
      </View>
    </ScreenWrapper>
  );
}