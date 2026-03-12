import React, { useState } from "react";
import { View, Text, Image, Pressable, ActivityIndicator, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "lucide-react-native";
import { usersApi } from "../../api/users.api";
import { useAuthStore } from "../../store/auth.store";

interface VendorAvatarProps {
  /** Current avatar URL from the user profile (undefined = show initial). */
  avatarUrl?: string;
  /** Fallback initial letter shown when no avatar exists. */
  initial?: string;
  /** Avatar diameter in pixels. Default 48. */
  size?: number;
  /** Whether the tap-to-upload interaction is enabled. Default true. */
  editable?: boolean;
}

export default function VendorAvatar({
  avatarUrl,
  initial = "V",
  size = 48,
  editable = true,
}: VendorAvatarProps) {
  const [uploading, setUploading] = useState(false);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const patchAvatar = useAuthStore((s) => s.patchAvatar);

  const displayUri = localUri ?? avatarUrl;

  async function handlePress() {
    if (!editable || uploading) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow photo library access in Settings to update your avatar.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) return;

    const uri = result.assets[0].uri;
    // Optimistic local preview
    setLocalUri(uri);
    setUploading(true);

    try {
      const url = await usersApi.uploadAvatar(uri);
      patchAvatar(url);
      setLocalUri(null); // server URL now in store; localUri no longer needed
    } catch {
      setLocalUri(null); // revert optimistic preview
      Alert.alert("Upload failed", "Could not update your avatar. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const avatarStyle = { width: size, height: size, borderRadius: size / 2 } as const;
  const overlaySize = Math.round(size * 0.38);
  const badgeOffset = Math.round(size * -0.04);

  return (
    <Pressable
      onPress={handlePress}
      disabled={!editable || uploading}
      style={avatarStyle}
      className="items-center justify-center bg-brand-slate overflow-hidden"
    >
      {/* Avatar image or initial */}
      {displayUri ? (
        <Image source={{ uri: displayUri }} style={avatarStyle} resizeMode="cover" />
      ) : (
        <Text
          style={{ fontSize: size * 0.38 }}
          className="text-brand-accent font-bold"
        >
          {initial.charAt(0).toUpperCase()}
        </Text>
      )}

      {/* Upload spinner overlay */}
      {uploading && (
        <View
          style={[avatarStyle, { position: "absolute" }]}
          className="bg-black/60 items-center justify-center"
        >
          <ActivityIndicator size="small" color="#22C55E" />
        </View>
      )}

      {/* Camera badge (bottom-right) */}
      {editable && !uploading && (
        <View
          style={{
            position: "absolute",
            bottom: badgeOffset,
            right: badgeOffset,
            width: overlaySize,
            height: overlaySize,
            borderRadius: overlaySize / 2,
          }}
          className="bg-brand-primary border-2 border-brand-night items-center justify-center"
        >
          <Camera size={overlaySize * 0.55} color="#FFFFFF" strokeWidth={2} />
        </View>
      )}
    </Pressable>
  );
}
