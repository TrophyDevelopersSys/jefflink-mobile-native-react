"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetAdminPassword } from "../../../src/lib/adminRecoveryClient";

type FormStatus = "idle" | "loading" | "success" | "error";

export default function AdminRecoveryResetForm() {
  const searchParams = useSearchParams();
  const defaultUserId = useMemo(
    () => searchParams.get("uid") ?? searchParams.get("userId") ?? "",
    [searchParams],
  );
  const defaultToken = useMemo(
    () => searchParams.get("token") ?? "",
    [searchParams],
  );

  const [userId, setUserId] = useState(defaultUserId);
  const [token, setToken] = useState(defaultToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUserId = userId.trim();
    const trimmedToken = token.trim();

    if (!trimmedUserId) {
      setStatus("error");
      setMessage("User ID is required.");
      return;
    }
    if (!trimmedToken) {
      setStatus("error");
      setMessage("Recovery token is required.");
      return;
    }
    if (newPassword.length < 10) {
      setStatus("error");
      setMessage("Admin passwords must be at least 10 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const data = await resetAdminPassword({
        userId: trimmedUserId,
        token: trimmedToken,
        newPassword,
      });

      setStatus("success");
      setMessage(
        data.message ||
          "Admin password reset successful. Please sign in with your new password.",
      );
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to reset password. The token may have expired.",
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
            <h1 className="text-2xl font-bold text-white">Reset Admin Password</h1>
          </div>
          <p className="text-white/70 text-sm mb-6">
            Enter your recovery details and choose a new password. The token
            expires after 15 minutes.
          </p>

          {status === "success" ? (
            <div className="text-center space-y-4">
              <p className="text-green-300 text-sm bg-green-900/30 rounded-xl px-4 py-3">
                {message}
              </p>
              <Link
                href="/login"
                className="inline-block bg-emerald-600 text-white font-semibold rounded-xl px-6 py-3 text-sm hover:bg-emerald-500 transition-colors"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              {/* Hidden field for password managers */}
              <input
                type="text"
                name="username"
                autoComplete="username"
                value={userId}
                readOnly
                tabIndex={-1}
                aria-hidden="true"
                className="sr-only"
              />

              <div>
                <label className="block text-white/80 text-sm font-medium mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="UUID from recovery link"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-1">
                  Recovery Token
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Token from recovery email"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="At least 10 characters"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                  required
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
                {status === "loading" ? "Resetting…" : "Reset Admin Password"}
              </button>

              <div className="flex justify-between text-sm">
                <Link
                  href="/admin-recovery"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Request new token
                </Link>
                <Link
                  href="/login"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
