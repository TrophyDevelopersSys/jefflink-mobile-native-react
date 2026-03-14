"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "../context/AuthContext";

const NAV_LINKS = [
  { href: "/cars", label: "Cars" },
  { href: "/land", label: "Land" },
  { href: "/houses", label: "Houses" },
  { href: "/commercial", label: "Commercial" },
  { href: "/vendors", label: "Vendors" },
  { href: "/search", label: "Search" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, signOut, status } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-night/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-brand-accent font-black text-xl tracking-tight">
              Jeff<span className="text-white">Link</span>
            </span>
            <span className="hidden sm:block text-xs font-medium bg-brand-primary/20 text-brand-accent px-2 py-0.5 rounded-badge">
              Marketplace
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? "bg-brand-primary/20 text-brand-accent"
                    : "text-brand-muted hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-brand-slate animate-pulse" />
            ) : isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 bg-brand-slate border border-border rounded-button px-3 py-1.5 text-sm text-white hover:border-brand-primary/50 transition-colors"
                  aria-haspopup="true"
                >
                  <span className="w-7 h-7 rounded-full bg-brand-primary/20 text-brand-accent flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {(user?.name ?? user?.email ?? "U").charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[120px] truncate">
                    {user?.name ?? user?.email ?? "Account"}
                  </span>
                  <svg className="w-3 h-3 text-brand-muted" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M6 8L1 3h10L6 8z" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-card shadow-lg py-1 z-50">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-white hover:bg-brand-slate transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        className="block px-4 py-2 text-sm text-white hover:bg-brand-slate transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      {(user?.role === "DEALER" || user?.role === "ADMIN") && (
                        <Link
                          href="/dashboard/listings"
                          className="block px-4 py-2 text-sm text-white hover:bg-brand-slate transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          My Listings
                        </Link>
                      )}
                      <hr className="border-border my-1" />
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-brand-danger hover:bg-brand-slate transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-brand-muted hover:text-white transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-brand-primary text-white text-sm font-semibold px-4 py-2 rounded-button hover:bg-brand-primary/90 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Post Listing CTA */}
            <Link
              href="/sell"
              className="hidden lg:block bg-brand-accent text-black text-sm font-bold px-4 py-2 rounded-button hover:bg-brand-accent/90 transition-colors"
            >
              + List Item
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-brand-muted hover:text-white transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-brand-night">
          <nav className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? "bg-brand-primary/20 text-brand-accent"
                    : "text-brand-muted hover:text-white hover:bg-white/5"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="px-4 pb-4 pt-2 border-t border-border space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="block text-center bg-brand-slate border border-border text-white text-sm font-semibold px-4 py-2.5 rounded-button"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={async () => { await handleSignOut(); setMenuOpen(false); }}
                  className="w-full text-center bg-transparent border border-brand-danger/40 text-brand-danger text-sm font-semibold px-4 py-2.5 rounded-button"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block text-center bg-brand-slate border border-border text-white text-sm font-semibold px-4 py-2.5 rounded-button"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block text-center bg-brand-primary text-white text-sm font-bold px-4 py-2.5 rounded-button"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
            <Link
              href="/sell"
              className="block text-center bg-brand-accent text-black text-sm font-bold px-4 py-2.5 rounded-button"
              onClick={() => setMenuOpen(false)}
            >
              + List an Item
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
