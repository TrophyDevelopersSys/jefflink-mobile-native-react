import type { Metadata } from "next";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Profile",
  description: "Update your JeffLink profile name, phone number, and account details.",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <ProfileClient />;
}
