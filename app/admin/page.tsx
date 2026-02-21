import Link from "next/link";
import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin",
};

const ADMIN_LINKS = [
  { href: "/admin/submissions", label: "Review Submissions", description: "Approve new venue submissions." },
  { href: "/admin/claims", label: "Review Claims", description: "Approve or reject ownership claims." },
  { href: "/admin/corrections", label: "Review Corrections", description: "Moderate user correction reports." },
  { href: "/admin/blog", label: "Manage Blog", description: "Create and edit blog content." },
];

export default async function AdminHomePage() {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">
              Admin
            </span>
          </div>
          <h1 className="text-cream mb-2">Admin Panel</h1>
          <p className="text-muted">Manage core moderation and content workflows.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {ADMIN_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border border-default bg-charcoal p-5 hover:border-masters-green/60 transition-colors"
            >
              <h2 className="text-cream mb-1">{item.label}</h2>
              <p className="text-sm text-muted">{item.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/dashboard" className="text-muted hover:text-cream transition-colors">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
