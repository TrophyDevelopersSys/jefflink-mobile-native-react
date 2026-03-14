"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const apiBase =
        process.env["NEXT_PUBLIC_API_BASE_URL"] ?? "/api/v1";
      const res = await fetch(`${apiBase}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("If that email is registered, you'll receive a reset link shortly.");
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setMessage((data as { message?: string }).message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Reset Password</h1>
          <p className="text-white/70 text-sm mb-6">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {status === "success" ? (
            <div className="text-center space-y-4">
              <p className="text-green-300 text-sm bg-green-900/30 rounded-xl px-4 py-3">
                {message}
              </p>
              <Link
                href="/login"
                className="block text-white/70 hover:text-white text-sm transition-colors"
              >
                ← Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
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
                className="w-full bg-white text-blue-700 font-semibold rounded-xl py-3 text-sm hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "loading" ? "Sending…" : "Send Reset Link"}
              </button>

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
