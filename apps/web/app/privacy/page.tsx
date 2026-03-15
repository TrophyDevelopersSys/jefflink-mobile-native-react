import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how JeffLink collects, uses, and protects your personal data on Uganda's leading marketplace platform.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-text">
      {/* Hero */}
      <section className="bg-surface border-b border-border py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4">
            Privacy <span className="text-brand-accent">Policy</span>
          </h1>
          <p className="text-text-muted text-sm">Last updated: January 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-10 text-text-muted leading-relaxed">

          <div>
            <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
            <p>
              JeffLink (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting
              your personal information. This Privacy Policy explains how we collect, use,
              and safeguard your data when you use our Platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-white">Account data:</strong> name, email address,
                phone number, and password (stored as a salted hash).
              </li>
              <li>
                <strong className="text-white">Listing data:</strong> vehicle details,
                property information, photos, and pricing you submit.
              </li>
              <li>
                <strong className="text-white">Usage data:</strong> pages visited, search
                queries, and interaction events to improve the Platform.
              </li>
              <li>
                <strong className="text-white">Transaction data:</strong> payment records
                and hire-purchase agreements associated with your account.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To create and manage your JeffLink account.</li>
              <li>To display and match listings with prospective buyers.</li>
              <li>To process payments and hire-purchase transactions.</li>
              <li>To send service notifications and, with your consent, promotional messages.</li>
              <li>To detect fraud and ensure platform security.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">4. Data Sharing</h2>
            <p>
              We do not sell your personal data. We may share data with:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Verified dealers and financial partners to facilitate transactions you initiate.</li>
              <li>Service providers (e.g., cloud storage, analytics) under strict data-processing agreements.</li>
              <li>Law enforcement agencies where required by Ugandan law.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">5. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active or as
              required by law. You may request deletion of your account and associated data
              by contacting us.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">6. Security</h2>
            <p>
              We use industry-standard security measures including encrypted connections
              (HTTPS), hashed passwords, and access controls to protect your data.
              No system is completely secure; we encourage you to use a strong, unique
              password for your account.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">7. Cookies</h2>
            <p>
              JeffLink uses session cookies for authentication and analytics cookies to
              understand how the Platform is used. You can disable cookies in your browser
              settings, though this may limit some features.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">8. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal data.
              To exercise these rights, please{" "}
              <Link href="/contact" className="text-brand-accent hover:underline">
                contact us
              </Link>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of
              material changes via email or a prominent notice on the Platform.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
