import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Platform, Text, TextInput } from "react-native";
import { fonts } from "@jefflink/design-tokens";

type WithDefaultProps<T> = T & {
  defaultProps?: {
    style?: unknown;
  };
};

function mergeStyle(existing: unknown, next: { fontFamily: string }) {
  if (Array.isArray(existing)) {
    return [...existing, next];
  }

  if (existing) {
    return [existing, next];
  }

  return next;
}

function applyGlobalFontDefaults() {
  const text = Text as WithDefaultProps<typeof Text>;
  const textInput = TextInput as WithDefaultProps<typeof TextInput>;
  const style = { fontFamily: fonts.family.sans };

  text.defaultProps = {
    ...(text.defaultProps ?? {}),
    style: mergeStyle(text.defaultProps?.style, style),
  };

  textInput.defaultProps = {
    ...(textInput.defaultProps ?? {}),
    style: mergeStyle(textInput.defaultProps?.style, style),
  };
}

export default function FontProvider({ children }: PropsWithChildren) {
  const [loaded] = useFonts({
    [fonts.family.regular]: Platform.select({
      default: fonts.source.regular.ttf,
      web: fonts.source.regular.woff2,
    }) as string,
    [fonts.family.light]: Platform.select({
      default: fonts.source.light.ttf,
      web: fonts.source.light.woff2,
    }) as string,
    [fonts.family.bold]: Platform.select({
      default: fonts.source.bold.ttf,
      web: fonts.source.bold.woff2,
    }) as string,
  });

  useEffect(() => {
    if (loaded) {
      applyGlobalFontDefaults();
    }
  }, [loaded]);

  if (Platform.OS !== "web" && !loaded) {
    return null;
  }

  return <>{children}</>;
}