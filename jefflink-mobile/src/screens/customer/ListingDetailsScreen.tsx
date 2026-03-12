import { Text, View } from "react-native";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import ListingGallery from "../../components/listing/ListingGallery";
import ListingHeader from "../../components/listing/ListingHeader";
import ListingMeta from "../../components/listing/ListingMeta";
import ListingPrice from "../../components/listing/ListingPrice";
import ListingSpec from "../../components/listing/ListingSpec";
import Divider from "../../components/ui/Divider";
import StatusBadge from "../../components/ui/StatusBadge";

export default function ListingDetailsScreen() {
  return (
    <AppChrome title="Details" activeKey="search" variant="customer">
      <View className="gap-4 px-6 pt-6">
        <Header title="Listing details" subtitle="Verified asset info" />
        <ListingGallery count={14} />
        <ListingHeader
          title="Mercedes-Benz GLE 450"
          subtitle="Kampala, UG · Platinum dealer"
        />
        <StatusBadge label="API sourced" />
        <ListingPrice price="UGX 385,000,000" cadence="Monthly from UGX 9,600,000" />
        <ListingMeta items={["GPS-ready", "Hire purchase", "Verified"]} />
        <Divider />
        <View className="gap-3">
          <Text className="text-base font-semibold text-white">
            Key specifications
          </Text>
          <View className="flex-row flex-wrap gap-3">
            <ListingSpec label="Engine" value="3.0L Turbo" />
            <ListingSpec label="Year" value="2023" />
            <ListingSpec label="Mileage" value="18,000 km" />
            <ListingSpec label="Transmission" value="Automatic" />
          </View>
        </View>
      </View>
    </AppChrome>
  );
}
