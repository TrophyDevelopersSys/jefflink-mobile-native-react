"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { requestAdminRecovery } from "../../src/lib/adminRecoveryClient";

export default function AdminRecoveryRequestForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(() => searchParams.get("email") ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const data = await requestAdminRecovery(email.trim());
      setStatus("success");
      setMessage(
        data.message ||
          "If that email belongs to an admin account, a recovery link has been sent.",
      );
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Network error. Please check your connection and try again.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Recovery</h1>
          </div>
          <p className="text-white/70 text-sm mb-6">
            Enter your admin email to receive a secure recovery link. This flow
            is restricted to admin accounts only.
          </p>

          {status === "success" ? (
            <div className="text-center space-y-4">
              <p className="text-green-300 text-sm bg-green-900/30 rounded-xl px-4 py-3">
                {message}
              </p>
              <p className="text-white/60 text-xs">
                The recovery link is valid for 15 minutes. Check your email
                (including spam) for the reset instructions.
              </p>
              <Link
                href="/login"
                className="block text-white/70 hover:text-white text-sm transition-colors"
              >
                ← Back to login
              </Link>
              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  setMessage("");
                }}
                className="mx-auto block text-white/70 hover:text-white text-sm transition-colors"
              >
                Resend recovery email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-1">
                  Admin email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@jefflinkcars.com"
                  required
                  autoComplete="email"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-sm"
                />
              </div>

              {status === "error" && (
                <p className="text-red-300 text-sm bg-red-900/30 rounded-xl px-4 py-3">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-emerald-600 text-white font-semibold rounded-xl py-3 text-sm hover:bg-emerald-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "loading" ? "Sending…" : "Send Recovery Link"}
              </button>

              <p className="text-center text-white/60 text-sm">
                <Link
                  href="/admin-recovery/reset"
                  className="hover:text-white transition-colors"
                >
                  Already have a recovery token? Reset now
                </Link>
              </p>

              <p className="text-center text-white/60 text-sm">
                <Link href="/login" className="hover:text-white transition-colors">
                  ← Back to login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
