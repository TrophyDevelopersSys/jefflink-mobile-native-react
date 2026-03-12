import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-text flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl font-extrabold text-brand-primary mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-text-muted mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-block bg-brand-primary text-white font-semibold px-6 py-3 rounded-button hover:bg-brand-primary/90 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/cars"
            className="inline-block bg-surface border border-border text-text font-semibold px-6 py-3 rounded-button hover:bg-card transition-colors"
          >
            Browse Listings
          </Link>
        </div>
      </div>
    </main>
  );
}
