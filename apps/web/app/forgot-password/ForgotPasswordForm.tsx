"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { forgotPassword as requestForgotPassword } from "../../src/lib/authClient";

export default function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(() => searchParams.get("email") ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [resetUserId, setResetUserId] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");
    setResetUrl("");
    setResetUserId("");
    setResetToken("");

    try {
      const data = await requestForgotPassword(email.trim());
      setStatus("success");
      setMessage(
        data.message || "If that email is registered, you'll receive a reset link shortly.",
      );
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
      if (data.userId) {
        setResetUserId(data.userId);
      }
      if (data.token) {
        setResetToken(data.token);
      }
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
              {resetUrl && (
                <a
                  href={resetUrl}
                  className="inline-block text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 transition-colors"
                >
                  Continue to password reset
                </a>
              )}
              {!resetUrl && resetUserId && resetToken && (
                <Link
                  href={`/reset-password?uid=${encodeURIComponent(resetUserId)}&token=${encodeURIComponent(resetToken)}`}
                  className="inline-block text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 transition-colors"
                >
                  Continue to password reset
                </Link>
              )}
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
                Resend another reset email
              </button>
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
                <Link href="/reset-password" className="hover:text-white transition-colors">
                  Already have a token? Reset now
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