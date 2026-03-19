"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type FormStatus = "idle" | "loading" | "success" | "error";

function getMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const record = payload as Record<string, unknown>;
  if (typeof record["message"] === "string") return record["message"];
  if (record["data"] && typeof record["data"] === "object") {
    const data = record["data"] as Record<string, unknown>;
    if (typeof data["message"] === "string") return data["message"];
  }
  return fallback;
}

export default function ResetPasswordPage() {
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
      setMessage("Reset token is required.");
      return;
    }
    if (newPassword.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters.");
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
      const apiBase = process.env["NEXT_PUBLIC_API_BASE_URL"] ?? "/api/v1";
      const res = await fetch(`${apiBase}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: trimmedUserId,
          token: trimmedToken,
          newPassword,
        }),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        setStatus("error");
        setMessage(getMessage(payload, "Unable to reset password. Please try again."));
        return;
      }

      setStatus("success");
      setMessage(
        getMessage(
          payload,
          "Password reset successful. Please sign in with your new password.",
        ),
      );
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Set New Password</h1>
          <p className="text-white/70 text-sm mb-6">
            Enter your reset details and choose a new password.
          </p>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
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
              <label className="block text-white/80 text-sm font-medium mb-1">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="UUID from reset link"
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-1">Reset Token</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Token from reset link"
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
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
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
              />
            </div>

            {(status === "error" || status === "success") && (
              <p
                className={`text-sm rounded-xl px-4 py-3 ${
                  status === "error"
                    ? "text-red-300 bg-red-900/30"
                    : "text-green-300 bg-green-900/30"
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-white text-blue-700 font-semibold rounded-xl py-3 text-sm hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Resetting…" : "Reset Password"}
            </button>

            <div className="text-center text-sm">
              <Link href="/login" className="text-white/70 hover:text-white transition-colors">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
