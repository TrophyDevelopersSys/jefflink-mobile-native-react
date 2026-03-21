import React from "react";
import Link from "next/link";

const MARKETPLACE_LINKS = [
  { href: "/cars", label: "Cars for Sale" },
  { href: "/land", label: "Land & Plots" },
  { href: "/houses", label: "Houses" },
  { href: "/commercial", label: "Commercial" },
  { href: "/vendors", label: "Vendors" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About JeffLink" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/contact", label: "Contact Us" },
];

const ACCOUNT_LINKS = [
  { href: "/login", label: "Sign In" },
  { href: "/register", label: "Create Account" },
  { href: "/sell", label: "Post a Listing" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-brand-accent font-black text-xl tracking-tight">
                Jeff<span className="text-text">Link</span>
              </span>
            </Link>
            <p className="text-brand-muted text-sm leading-relaxed">
              Uganda&apos;s leading hire-purchase and marketplace platform for
              vehicles, properties, and financial products.
            </p>
            <p className="text-brand-muted text-xs mt-4">
              API Base: <span className="text-brand-accent">api.jefflinkcars.com</span>
            </p>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="text-text font-semibold text-sm mb-4 uppercase tracking-wide">
              Marketplace
            </h3>
            <ul className="space-y-2">
              {MARKETPLACE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-muted text-sm hover:text-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-text font-semibold text-sm mb-4 uppercase tracking-wide">
              Company
            </h3>
            <ul className="space-y-2">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-muted text-sm hover:text-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-text font-semibold text-sm mb-4 uppercase tracking-wide">
              Account
            </h3>
            <ul className="space-y-2">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-muted text-sm hover:text-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs text-center sm:text-left">
            © {new Date().getFullYear()} JeffLink. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <Link href="/privacy" className="hover:text-text transition-colors">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-text transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

