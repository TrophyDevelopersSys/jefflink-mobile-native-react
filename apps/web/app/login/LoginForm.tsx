"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "../../src/context/AuthContext";

// ─── Step indicators (mirrors mobile LoginScreen STEPS) ────────────────────

const STEPS = [{ label: "Identify" }, { label: "Verify" }];

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, status } = useAuthContext();

  const [step, setStep] = useState(0);
  const [isDealer, setIsDealer] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");

  const isLoading = status === "loading";

  // ── Step 0: validate email ──────────────────────────────────────────────
  const goNext = () => {
    setEmailError("");
    if (!email.trim()) {
      setEmailError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setStep(1);
  };

  // ── Step 1: submit ──────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!password) {
      setFormError("Password is required.");
      return;
    }
    try {
      await signIn(email.trim(), password);
      const nextPath = searchParams.get("next");
      if (nextPath && nextPath.startsWith("/")) {
        router.push(nextPath);
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed. Please try again.";
      setFormError(msg);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8">

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
          <p className="text-white/70 text-sm mb-6">Sign in to your JeffLink account</p>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {STEPS.map((s, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      i < step
                        ? "bg-brand-accent text-white"
                        : i === step
                        ? "bg-white text-blue-700"
                        : "bg-white/25 text-white/60"
                    }`}
                  >
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span className="text-[10px] text-white/60">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mb-4 transition-colors ${
                      i < step ? "bg-brand-accent" : "bg-white/25"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {step === 0 ? (
            /* ── Step 0 ── */
            <div className="space-y-5">
              {/* Dealer toggle */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-white text-sm">Are you a Dealer?</span>
                <span className="relative inline-flex w-11 h-6">
                  <input
                    type="checkbox"
                    checked={isDealer}
                    onChange={(e) => setIsDealer(e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`w-11 h-6 rounded-full transition-colors focus-within:ring-2 focus-within:ring-brand-accent/50 ${
                      isDealer ? "bg-brand-accent" : "bg-white/30"
                    }`}
                  />
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      isDealer ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </span>
              </label>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-white text-sm mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && goNext()}
                  placeholder="you@example.com"
                  className="w-full bg-white/10 border border-white/20 rounded-input px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-brand-accent/60 focus:ring-1 focus:ring-brand-accent/30"
                  aria-describedby={emailError ? "email-error" : undefined}
                />
                {emailError && (
                  <p id="email-error" className="mt-1.5 text-xs text-red-300">{emailError}</p>
                )}
              </div>

              <button
                type="button"
                onClick={goNext}
                className="w-full bg-brand-accent text-black font-bold py-3 rounded-button hover:bg-brand-accent/90 transition-colors"
              >
                Continue →
              </button>

              <p className="text-center text-sm text-white/60">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-brand-accent font-medium hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          ) : (
            /* ── Step 1 ── */
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <input
                type="email"
                name="username"
                autoComplete="username"
                value={email}
                readOnly
                tabIndex={-1}
                aria-hidden="true"
                className="sr-only"
              />
              {/* Display email readout */}
              <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 flex items-center justify-between">
                <span className="text-white/80 text-sm truncate">{email}</span>
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="text-brand-accent text-xs ml-2 hover:underline flex-shrink-0"
                >
                  Change
                </button>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-white text-sm mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFormError(""); }}
                    placeholder="••••••••"
                    className="w-full bg-white/10 border border-white/20 rounded-input px-4 py-3 pr-12 text-white placeholder-white/40 text-sm focus:outline-none focus:border-brand-accent/60 focus:ring-1 focus:ring-brand-accent/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-xs"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm px-4 py-2.5 rounded-lg"
                >
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-accent text-black font-bold py-3 rounded-button hover:bg-brand-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in…" : "Sign In"}
              </button>

              <div className="flex items-center justify-between text-sm">
                <Link href="/forgot-password" className="text-white/60 hover:text-white">
                  Forgot password?
                </Link>
                <Link href="/register" className="text-brand-accent hover:underline">
                  Create account
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Back to home */}
        <p className="text-center mt-6">
          <Link href="/" className="text-white/50 text-sm hover:text-white transition-colors">
            ← Back to JeffLink
          </Link>
        </p>
      </div>
    </main>
  );
}
