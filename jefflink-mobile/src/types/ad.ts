import type { ImageSourcePropType } from "react-native";

export type AdBanner = {
  id: string;
  title: string;
  advertiser: string;
  image: ImageSourcePropType;
  logo?: ImageSourcePropType;
  cta: string;
  targetUrl: string;
};
