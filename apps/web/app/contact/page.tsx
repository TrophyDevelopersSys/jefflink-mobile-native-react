import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the JeffLink team. We are happy to help with listings, account questions, and partnership inquiries.",
  openGraph: {
    title: "Contact JeffLink — Uganda's Marketplace",
    description: "Reach the JeffLink support team for help, feedback, or business enquiries.",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-text">
      {/* Hero */}
      <section className="bg-surface border-b border-border py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-white mb-3">Contact Us</h1>
          <p className="text-text-muted text-lg">
            Questions, feedback, or partnership enquiries — we&apos;d love to
            hear from you.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Contact details */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6">Get In Touch</h2>
          <div className="space-y-5">
            {[
              { icon: "📧", label: "Email", value: "support@jefflink.ug", href: "mailto:support@jefflink.ug" },
              { icon: "📞", label: "Phone", value: "+256 700 000 000", href: "tel:+256700000000" },
              { icon: "📍", label: "Location", value: "Kampala, Uganda", href: null },
            ].map((c) => (
              <div key={c.label} className="flex gap-4 items-start bg-card border border-border rounded-card p-4">
                <span className="text-2xl flex-shrink-0">{c.icon}</span>
                <div>
                  <p className="text-brand-muted text-xs uppercase tracking-wide mb-0.5">{c.label}</p>
                  {c.href ? (
                    <a
                      href={c.href}
                      className="text-white text-sm hover:text-brand-accent transition-colors"
                    >
                      {c.value}
                    </a>
                  ) : (
                    <p className="text-white text-sm">{c.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="text-white font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: "/how-it-works", label: "How JeffLink Works" },
                { href: "/about", label: "About Us" },
                { href: "/vendors", label: "Find Verified Vendors" },
                { href: "/register", label: "Create an Account" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-brand-muted text-sm hover:text-brand-accent transition-colors"
                  >
                    → {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Contact form note — backend form submission to be wired separately */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6">Send a Message</h2>
          <div className="bg-card border border-border rounded-card p-6 space-y-4">
            <p className="text-text-muted text-sm">
              Fill in the form below and our team will respond within 24 hours.
            </p>
            <div>
              <label className="block text-white text-sm font-medium mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full bg-brand-slate border border-border rounded-input px-4 py-3 text-white placeholder-brand-muted text-sm focus:outline-none focus:border-brand-primary/60"
                readOnly
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full bg-brand-slate border border-border rounded-input px-4 py-3 text-white placeholder-brand-muted text-sm focus:outline-none focus:border-brand-primary/60"
                readOnly
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-1.5">
                Message
              </label>
              <textarea
                rows={4}
                placeholder="How can we help?"
                className="w-full bg-brand-slate border border-border rounded-input px-4 py-3 text-white placeholder-brand-muted text-sm focus:outline-none focus:border-brand-primary/60 resize-none"
                readOnly
              />
            </div>
            <p className="text-brand-muted text-xs">
              Contact form submission coming soon. For now, please reach us directly at{" "}
              <a href="mailto:support@jefflink.ug" className="text-brand-accent hover:underline">
                support@jefflink.ug
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
