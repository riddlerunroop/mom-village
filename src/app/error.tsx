"use client";

import Link from "next/link";

// New 2026-07-30 — audit finding #13 (Important). Without this, any
// unhandled error on any route fell through to Next's generic, unbranded
// error screen. Error boundaries in the App Router must be client
// components. `reset()` re-renders the segment that threw, in case it was
// a transient issue (a dropped network request, etc).
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-6">
      <div className="w-full max-w-[420px] text-center">
        <div className="font-display text-2xl font-semibold text-indigo mb-4">
          mom<span className="text-gold-deep">village</span>
        </div>
        <h1 className="font-display text-xl text-indigo mb-2">
          Something went wrong on our end
        </h1>
        <p className="text-sm text-ink/65 mb-6">
          Nothing you did caused this — try again, or head back home if it
          keeps happening.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="text-sm font-semibold px-6 py-2.5 rounded-full bg-gold-deep text-ivory"
          >
            Try again
          </button>
          <Link
            href="/"
            className="text-sm font-semibold px-6 py-2.5 rounded-full border-[1.5px] border-indigo text-indigo"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
