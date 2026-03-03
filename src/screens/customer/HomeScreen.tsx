import { ScrollView, Text, View } from "react-native";
import { useEffect } from "react";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import Header from "../../components/layout/Header";
import Section from "../../components/layout/Section";
import BalanceSummary from "../../components/finance/BalanceSummary";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import AlertBanner from "../../components/ui/AlertBanner";
import StatCard from "../../components/ui/StatCard";
import Tabs from "../../components/ui/Tabs";
import VehicleCard from "../../components/marketplace/VehicleCard";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import { useListingsFeature } from "../../features/listings";

export default function HomeScreen() {
  const { listings, loadVehicles, loading, error } = useListingsFeature();

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const featured = listings[0];

  return (
    <ScreenWrapper className="px-6 pt-6">
      <ScrollView contentContainerClassName="gap-6">
        <Header
          title="JEFFLINK MOTORS"
          subtitle="Verified. Finance-ready. Premium vehicles."
        />

        <Input
          label="Search"
          value=""
          placeholder="Search make, model, or dealer"
          onChangeText={() => {}}
        />

        <Tabs tabs={["Vehicles", "Property"]} activeIndex={0} onChange={() => {}} />

        <AlertBanner
          tone="success"
          message="Ledger sync live. Installments are always server-authoritative."
        />

        <Section title="Finance overview">
          <View className="gap-4">
            <BalanceSummary
              title="Next installment"
              value="Server-calculated"
              subtitle="Ledger authority only"
            />
            <BalanceSummary
              title="Outstanding balance"
              value="Server-calculated"
              subtitle="Neon financial source"
            />
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <StatCard label="Active contracts" value="04" helper="On time" />
            </View>
            <View className="flex-1">
              <StatCard label="Risk posture" value="Low" helper="Stable" />
            </View>
          </View>
        </Section>

        <View className="gap-3">
          <Text className="text-base font-semibold text-white">
            Featured vehicles
          </Text>
          {loading ? (
            <Spinner size="large" />
          ) : error ? (
            <EmptyState title="Unable to load" message={error} />
          ) : featured ? (
            <VehicleCard
              title={featured.title}
              price={featured.price}
              location={featured.location}
              dealer="Jefflink Verified Dealer"
              verified
              hirePurchaseReady
            />
          ) : (
            <EmptyState
              title="No listings yet"
              message="Inventory will appear once live data is available."
            />
          )}
        </View>

        <Card>
          <Text className="text-base font-semibold text-white">
            Trusted acquisition
          </Text>
          <Text className="mt-2 text-sm text-brand-muted">
            Verified sellers. Finance-approved inventory. GPS-compliant assets.
          </Text>
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}
