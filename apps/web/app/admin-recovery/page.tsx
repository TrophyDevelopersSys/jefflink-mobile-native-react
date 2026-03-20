import { Suspense } from "react";
import type { Metadata } from "next";
import AdminRecoveryRequestForm from "./AdminRecoveryRequestForm";

export const metadata: Metadata = {
  title: "Admin Account Recovery",
  description: "Request a recovery link for your JeffLink admin account.",
};

function Fallback() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8">
          <p className="text-white/80 text-sm">Loading recovery form...</p>
        </div>
      </div>
    </main>
  );
}

export default function AdminRecoveryPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <AdminRecoveryRequestForm />
    </Suspense>
  );
}
