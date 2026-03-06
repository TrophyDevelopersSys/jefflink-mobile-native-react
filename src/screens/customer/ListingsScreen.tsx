import { ScrollView, Text, View } from "react-native";
import { useEffect } from "react";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import ListingHeader from "../../components/listing/ListingHeader";
import ListingMeta from "../../components/listing/ListingMeta";
import Tabs from "../../components/ui/Tabs";
import Chip from "../../components/ui/Chip";
import VehicleCard from "../../components/marketplace/VehicleCard";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import { useListingsFeature } from "../../features/listings";

export default function ListingsScreen() {
  const { listings, loadVehicles, loading, error } = useListingsFeature();

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  return (
    <AppChrome
      title="Listings"
      activeKey="search"
      variant="customer"
      showBottomNav={false}
    >
      <ScrollView contentContainerClassName="gap-5 px-6 pt-6 pb-6">
        <Header title="Explore inventory" subtitle="Premium verified vehicles" />
        <Tabs tabs={["Vehicles", "Property"]} activeIndex={0} onChange={() => {}} />
        <View className="flex-row flex-wrap gap-2">
          <Chip label="Hire purchase" />
          <Chip label="Verified" />
          <Chip label="Platinum dealers" />
        </View>
        <View className="gap-4">
          <ListingHeader
            title="Featured selection"
            subtitle="Finance-approved listings"
          />
          <ListingMeta items={["GPS-ready", "Ledger backed", "Insured"]} />
          {loading ? (
            <Spinner size="large" />
          ) : error ? (
            <EmptyState title="Unable to load" message={error} />
          ) : listings.length ? (
            listings.map((listing) => (
              <VehicleCard
                key={listing.id}
                title={listing.title}
                price={listing.price}
                location={listing.location}
                dealer="Jefflink Motors"
                verified
                hirePurchaseReady
              />
            ))
          ) : (
            <EmptyState
              title="No listings yet"
              message="Inventory will appear once live data is available."
            />
          )}
          <Text className="text-xs text-brand-muted">
            Inventory is finance-approved and sourced from the backend only.
          </Text>
        </View>
      </ScrollView>
    </AppChrome>
  );
}
