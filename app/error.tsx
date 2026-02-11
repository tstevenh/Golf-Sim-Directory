"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function Error({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-1 h-8 bg-red-500 rounded-full" />
          <span className="text-red-400 text-xs font-mono uppercase tracking-widest">
            Something went wrong
          </span>
        </div>

        <h1 className="text-cream text-2xl sm:text-3xl font-bold mb-4">
          Unexpected Error
        </h1>
        <p className="text-muted mb-8">
          We hit a snag loading this page. Try refreshing, or head back to the
          homepage.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-masters-green text-deep-black font-semibold hover:bg-masters-green/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-default text-cream hover:border-masters-green transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
