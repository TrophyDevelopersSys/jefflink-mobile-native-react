import { FlatList, View } from "react-native";
import { View as MotiView } from "moti/build/components/view";
import ListingCard from "../listing/ListingCard";
import { useListings } from "../../features/listings/listings.hooks";
import Spinner from "../ui/Spinner";
import EmptyState from "../ui/EmptyState";

type HorizontalListingListProps = {
  type: "featured" | "recent";
};

export default function HorizontalListingList({
  type
}: HorizontalListingListProps) {
  const { listings, loading, error } = useListings(type);

  if (loading) {
    return (
      <View className="mt-4 px-6">
        <Spinner size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="mt-4 px-6">
        <EmptyState title="Unable to load" message={error} />
      </View>
    );
  }

  if (!listings.length) {
    return (
      <View className="mt-4 px-6">
        <EmptyState
          title="No listings yet"
          message="Inventory will appear once live data is available."
        />
      </View>
    );
  }

  return (
    <View className="mt-4 pl-6">
      <FlatList
        data={listings}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 350, delay: index * 60 }}
          >
            <ListingCard item={item} />
          </MotiView>
        )}
      />
    </View>
  );
}
