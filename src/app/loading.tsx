// New 2026-07-30 — audit finding #13 (Important). Without this, every
// route showed the browser's default blank white screen while its data
// loaded, with nothing on-brand. Next.js shows this automatically while
// any route segment (and everything below it, unless overridden by a more
// specific loading.tsx) is loading.
export default function Loading() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-[3px] border-gold-deep/25 border-t-gold-deep animate-spin" />
        <p className="font-display italic text-sm text-sage-deep">
          Just a moment…
        </p>
      </div>
    </div>
  );
}
