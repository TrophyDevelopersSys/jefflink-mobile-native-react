import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read JeffLink's Terms of Service covering usage rules, buyer and seller responsibilities, and platform policies for Uganda's marketplace.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-text">
      {/* Hero */}
      <section className="bg-surface border-b border-border py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-text mb-4">
            Terms of <span className="text-brand-accent">Service</span>
          </h1>
          <p className="text-text-muted text-sm">Last updated: January 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-10 text-text-muted leading-relaxed">

          <div>
            <h2 className="text-xl font-bold text-text mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using JeffLink (&quot;the Platform&quot;), you agree to be bound by
              these Terms of Service. If you do not agree to these terms, please do not use
              the Platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text mb-3">2. Use of the Platform</h2>
            <p>
              JeffLink provides a marketplace connecting buyers and sellers of vehicles,
              land, and properties across Uganda. You agree to use the Platform only for
              lawful purposes and in accordance with these Terms.
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>You must be at least 18 years old to create an account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You agree not to post false, misleading, or fraudulent listings.</li>
              <li>JeffLink reserves the right to remove any listing that violates platform policies.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text mb-3">3. Seller Responsibilities</h2>
            <p>
              Sellers are responsible for the accuracy of their listings, including pricing,
              condition, and ownership status. JeffLink acts as an intermediary and is not
              liable for disputes arising between buyers and sellers.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text mb-3">4. Buyer Responsibilities</h2>
            <p>
              Buyers are encouraged to verify all listing details independently before making
              any purchase or payment. JeffLink recommends conducting due diligence and, where
              applicable, engaging legal or financial advisors.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text mb-3">5. Hire-Purchase &amp; Finance</h2>
            <p>
              JeffLink may facilitate hire-purchase agreements through verified dealers.
              All finance terms, interest rates, and repayment schedules are set by the
              respective dealer or financial partner. JeffLink is not a financial institution.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text mb-3">6. Intellectual Property</h2>
            <p>
              All content on the Platform — including logos, design elements, and software —
              is the property of JeffLink or its licensors. You may not reproduce or distribute
              Platform content without prior written consent.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text mb-3">7. Limitation of Liability</h2>
            <p>
              JeffLink provides the Platform on an &quot;as is&quot; basis. To the fullest extent
              permitted by Ugandan law, JeffLink shall not be liable for indirect, incidental,
              or consequential damages arising from use of the Platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text mb-3">8. Changes to Terms</h2>
            <p>
              JeffLink reserves the right to update these Terms at any time. Continued use of
              the Platform after changes constitutes acceptance of the revised Terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text mb-3">9. Contact</h2>
            <p>
              For questions about these Terms, please{" "}
              <Link href="/contact" className="text-brand-accent hover:underline">
                contact us
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
