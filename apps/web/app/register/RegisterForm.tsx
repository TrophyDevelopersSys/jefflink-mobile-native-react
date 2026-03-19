"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register as registerAccount } from "../../src/lib/authClient";
import { useAuthContext } from "../../src/context/AuthContext";
import { webAuthAdapter, webRefreshAdapter } from "../../src/lib/authAdapter";

// ─── 3-step flow mirrors mobile RegisterScreen ───────────────────────────────

const STEPS = [
  { label: "Account" },
  { label: "Contact" },
  { label: "Security" },
];

export default function RegisterForm() {
  const router = useRouter();
  const { signIn, status } = useAuthContext();

  const [step, setStep] = useState(0);
  const [isDealer, setIsDealer] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Field errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isLoading = status === "loading";

  // ── Validation per step ─────────────────────────────────────────────────
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!fullName.trim()) newErrors["fullName"] = "Full name is required.";
      else if (fullName.trim().length < 2) newErrors["fullName"] = "Name must be at least 2 characters.";
    }

    if (step === 1) {
      if (!email.trim()) newErrors["email"] = "Email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors["email"] = "Enter a valid email.";
    }

    if (step === 2) {
      if (!password) newErrors["password"] = "Password is required.";
      else if (password.length < 8) newErrors["password"] = "Password must be at least 8 characters.";
      if (password !== confirmPassword) newErrors["confirmPassword"] = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setApiError(null);
    try {
      const result = await registerAccount(
        {
          name: fullName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
          isDealer,
          role: isDealer ? "VENDOR" : "CUSTOMER",
        },
        webAuthAdapter,
      );
      if (result.refreshToken) {
        webRefreshAdapter.setRefreshToken(result.refreshToken);
      }

      // Auto sign-in after registration
      await signIn(email.trim(), password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setApiError(msg);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 my-4">

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
          <p className="text-white/70 text-sm mb-6">Finance-ready access in minutes</p>

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

          <form onSubmit={handleSubmit} noValidate>
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

            {/* ── Step 0: Full Name + Dealer toggle ── */}
            {step === 0 && (
              <div className="space-y-5">
                {/* Dealer toggle */}
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-white text-sm">Registering as a Dealer?</span>
                  <span className="relative inline-flex w-11 h-6">
                    <input
                      type="checkbox"
                      checked={isDealer}
                      onChange={(e) => setIsDealer(e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`w-11 h-6 rounded-full transition-colors focus-within:ring-2 focus-within:ring-brand-accent/60 ${
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

                <div>
                  <label htmlFor="fullName" className="block text-white text-sm mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: "" })); }}
                    placeholder="John Doe"
                    className="w-full bg-white/10 border border-white/20 rounded-input px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-brand-accent/60"
                  />
                  {errors["fullName"] && (
                    <p className="mt-1.5 text-xs text-red-300">{errors["fullName"]}</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Step 1: Email + Phone ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-white text-sm mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                    placeholder="you@example.com"
                    className="w-full bg-white/10 border border-white/20 rounded-input px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-brand-accent/60"
                  />
                  {errors["email"] && (
                    <p className="mt-1.5 text-xs text-red-300">{errors["email"]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-white text-sm mb-1.5">
                    Phone Number <span className="text-white/40">(optional)</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+256 700 000 000"
                    className="w-full bg-white/10 border border-white/20 rounded-input px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-brand-accent/60"
                  />
                </div>
              </div>
            )}

            {/* ── Step 2: Password ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-white text-sm mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                      placeholder="Min. 8 characters"
                      className="w-full bg-white/10 border border-white/20 rounded-input px-4 py-3 pr-12 text-white placeholder-white/40 text-sm focus:outline-none focus:border-brand-accent/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-xs"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors["password"] && (
                    <p className="mt-1.5 text-xs text-red-300">{errors["password"]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-white text-sm mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: "" })); }}
                      placeholder="Re-enter password"
                      className="w-full bg-white/10 border border-white/20 rounded-input px-4 py-3 pr-12 text-white placeholder-white/40 text-sm focus:outline-none focus:border-brand-accent/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-xs"
                    >
                      {showConfirm ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors["confirmPassword"] && (
                    <p className="mt-1.5 text-xs text-red-300">{errors["confirmPassword"]}</p>
                  )}
                </div>

                {apiError && (
                  <div role="alert" className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm px-4 py-2.5 rounded-lg">
                    {apiError}
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="flex-1 bg-white/10 border border-white/20 text-white font-semibold py-3 rounded-button hover:bg-white/20 transition-colors"
                >
                  ← Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="flex-1 bg-brand-accent text-black font-bold py-3 rounded-button hover:bg-brand-accent/90 transition-colors"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-brand-accent text-black font-bold py-3 rounded-button hover:bg-brand-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating account…" : "Create Account"}
                </button>
              )}
            </div>
          </form>

          <p className="text-center mt-5 text-sm text-white/60">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-accent font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        <p className="text-center mt-4">
          <Link href="/" className="text-white/50 text-sm hover:text-white transition-colors">
            ← Back to JeffLink
          </Link>
        </p>
      </div>
    </main>
  );
}

