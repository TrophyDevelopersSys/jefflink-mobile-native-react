"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "../../../src/context/AuthContext";

const API = process.env["NEXT_PUBLIC_API_BASE_URL"] ?? "https://jefflink.onrender.com/api/v1";

interface ProfileForm {
  name: string;
  phone: string;
}

export default function ProfilePage() {
  const { user, isAuthenticated, status } = useAuthContext();
  const router = useRouter();

  const [form, setForm] = useState<ProfileForm>({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (status !== "loading" && !isAuthenticated) {
      router.replace("/login");
    }
  }, [status, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name ?? "", phone: "" });
    }
  }, [user]);

  if (status === "loading" || status === "idle") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!isAuthenticated || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("jl_access_token") : null;
      const res = await fetch(`${API}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: form.name.trim() || undefined,
          phone: form.phone.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message ?? "Failed to save profile");
      }
      setSaveSuccess(true);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const initials = (user.name ?? user.email ?? "U").slice(0, 2).toUpperCase();

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-brand-muted mb-6">
          <Link href="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          {" / "}
          <span className="text-white">Profile</span>
        </nav>

        <h1 className="text-2xl font-bold text-white mb-8">Edit Profile</h1>

        {/* Avatar placeholder */}
        <div className="flex items-center gap-5 mb-8 bg-card border border-border rounded-card p-5">
          <div className="w-16 h-16 rounded-full bg-brand-primary/20 text-brand-accent flex items-center justify-center font-bold text-2xl border border-brand-primary/30 flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-white font-semibold">{user.name ?? "Name not set"}</p>
            <p className="text-brand-muted text-sm">{user.email}</p>
            <span className="inline-block mt-1.5 text-xs bg-brand-primary/20 text-brand-accent px-2 py-0.5 rounded-full capitalize">
              {user.role?.toLowerCase() ?? "customer"}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="bg-card border border-border rounded-card p-6 space-y-5">
          <div>
            <label htmlFor="name" className="block text-white text-sm font-medium mb-1.5">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Your full name"
              className="w-full bg-brand-slate border border-border rounded-input px-4 py-3 text-white placeholder-brand-muted text-sm focus:outline-none focus:border-brand-primary/60"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-white text-sm font-medium mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={user.email ?? ""}
              readOnly
              disabled
              className="w-full bg-brand-night border border-border rounded-input px-4 py-3 text-brand-muted text-sm cursor-not-allowed"
            />
            <p className="text-brand-muted text-xs mt-1.5">Email cannot be changed here.</p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-white text-sm font-medium mb-1.5">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+256 700 000 000"
              className="w-full bg-brand-slate border border-border rounded-input px-4 py-3 text-white placeholder-brand-muted text-sm focus:outline-none focus:border-brand-primary/60"
            />
          </div>

          {saveError && (
            <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2.5 rounded-lg">
              {saveError}
            </div>
          )}

          {saveSuccess && (
            <div role="status" className="bg-brand-primary/10 border border-brand-primary/30 text-brand-accent text-sm px-4 py-2.5 rounded-lg">
              ✓ Profile updated successfully.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-primary text-white font-semibold px-6 py-2.5 rounded-button hover:bg-brand-primary/90 transition-colors disabled:opacity-60 text-sm"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <Link
              href="/dashboard"
              className="bg-brand-slate border border-border text-white text-sm font-medium px-6 py-2.5 rounded-button hover:border-brand-primary/40 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
