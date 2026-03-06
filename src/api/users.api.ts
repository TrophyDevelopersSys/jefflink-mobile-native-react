import { apiClient } from "./axios";
import { endpoints } from "../constants/endpoints";

export const usersApi = {
  /**
   * Upload an image from the local filesystem to the media service,
   * then persist the returned URL as the caller's avatar.
   *
   * @param imageUri  Local file URI returned by expo-image-picker
   * @returns         The public CDN URL of the uploaded avatar
   */
  async uploadAvatar(imageUri: string): Promise<string> {
    // ── 1. Upload image as multipart/form-data ─────────────────────────────
    const filename = imageUri.split("/").pop() ?? "avatar.jpg";
    const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
    const mimeType = ext === "png" ? "image/png" : "image/jpeg";

    const form = new FormData();
    form.append("file", {
      uri: imageUri,
      name: filename,
      type: mimeType,
    } as unknown as Blob);
    form.append("entityType", "avatar");

    const uploadRes = await apiClient.post<{ data: { url: string } }>(
      endpoints.media.upload,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );

    const avatarUrl = uploadRes.data.data.url;

    // ── 2. Persist the avatar URL on the user record ───────────────────────
    await apiClient.patch(endpoints.users.updateAvatar, { avatarUrl });

    return avatarUrl;
  },
};
