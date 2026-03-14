import React, { useState } from "react";
import { View, Image, Pressable, FlatList, Modal, Text, Dimensions } from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");

export interface ImageGalleryProps {
  images: string[];
  className?: string;
}

export function ImageGallery({ images, className = "" }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (images.length === 0) return null;

  return (
    <View className={className}>
      {/* Main image */}
      <Pressable onPress={() => setLightbox(true)} className="relative">
        <Image
          source={{ uri: images[activeIndex] }}
          style={{ width: SCREEN_W, height: 260 }}
          resizeMode="cover"
        />
        <View className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded-full">
          <Text className="text-white text-xs">{activeIndex + 1}/{images.length}</Text>
        </View>
      </Pressable>

      {/* Thumbnails */}
      {images.length > 1 ? (
        <FlatList
          horizontal
          data={images}
          keyExtractor={(_, i) => String(i)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ padding: 8, gap: 6 }}
          renderItem={({ item, index }) => (
            <Pressable onPress={() => setActiveIndex(index)}>
              <Image
                source={{ uri: item }}
                style={{ width: 56, height: 56, borderRadius: 6 }}
                className={index === activeIndex ? "border-2 border-brand-accent" : "opacity-60"}
              />
            </Pressable>
          )}
        />
      ) : null}

      {/* Lightbox */}
      <Modal visible={lightbox} transparent animationType="fade" onRequestClose={() => setLightbox(false)}>
        <Pressable className="flex-1 bg-black/95 items-center justify-center" onPress={() => setLightbox(false)}>
          <Image
            source={{ uri: images[activeIndex] }}
            style={{ width: SCREEN_W, height: SCREEN_W }}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>
    </View>
  );
}
