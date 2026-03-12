import React from "react";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  Text,
  useWindowDimensions,
  View,
  TouchableOpacity
} from "react-native";

import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import HyundaiLogo from "../../assets/icons/hyundai.svg";

type HeroBannerItem = {
  id: string;
  image: ImageSourcePropType;
  heading: string;
  text: string;
};

const banners: HeroBannerItem[] = [
  {
    id: "1",
    image: require("../../assets/images/demo007.png"),
    heading: "Hyundai i20 N Line",
    text: "Choose from a range of cars, from city rides to weekend getaways."
  },
  {
    id: "2",
    image: require("../../assets/images/demo004.png"),
    heading: "Verified Vehicles",
    text: "Only trusted sellers and verified vehicles on JeffLink."
  },
  {
    id: "3",
    image: require("../../assets/images/demo00.png"),
    heading: "Flexible Payments",
    text: "Buy your car with full payment or hire purchase."
  },
  {
    id: "4",
    image: require("../../assets/images/deom006.png"),
    heading: "Sell Faster",
    text: "List your vehicle and reach serious buyers across the platform."
  }
];

type Props = {
  onLogin?: () => void;
};

export default function HeroCarousel({ onLogin }: Props) {
  const { width } = useWindowDimensions();
  const flatRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const CARD_WIDTH = width - 32;

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (index + 1) % banners.length;

      flatRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true
      });

      setIndex(nextIndex);
    }, 4500);

    return () => clearInterval(timer);
  }, [index]);

  return (
    <View>
      <FlatList
        ref={flatRef}
        horizontal
        pagingEnabled
        data={banners}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 16 }}
        onMomentumScrollEnd={(e) => {
          const slide = Math.round(
            e.nativeEvent.contentOffset.x / CARD_WIDTH
          );
          setIndex(slide);
        }}
        renderItem={({ item }) => (
          <MotiView
            from={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: 450 }}
            style={{ width: CARD_WIDTH }}
            className="mr-4 overflow-hidden rounded-2xl"
          >
            <LinearGradient
              colors={["#111827", "#1f2937"]}
              className="p-6 rounded-2xl"
            >
              <View className="mb-2">
                <HyundaiLogo width={90} height={28} />
              </View>
              <Text className="text-white text-xl font-bold mb-4">
                {item.heading}
              </Text>
              <View className="items-center justify-center">
                <Image
                  source={item.image}
                  resizeMode="contain"
                  style={{
                    width: CARD_WIDTH - 80,
                    height: 120
                  }}
                />
              </View>
              <Text className="text-gray-300 text-sm mt-4">
                {item.text}
              </Text>
              <TouchableOpacity
                onPress={onLogin}
                activeOpacity={0.9}
                className="mt-5 bg-[#22C55E] rounded-xl py-3 items-center"
              >
                <Text className="text-black font-semibold">
                  Check It
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </MotiView>
        )}
      />
      <View className="mt-3 flex-row justify-center">
        {banners.map((_, i) => (
          <View
            key={i}
            className={
              i === index
                ? "mx-1 h-2 w-6 rounded-full bg-[#22C55E]"
                : "mx-1 h-2 w-2 rounded-full bg-gray-500"
            }
          />
        ))}
      </View>
    </View>
  );
}