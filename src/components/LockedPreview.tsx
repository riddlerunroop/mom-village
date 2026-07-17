import Link from "next/link";

export default function LockedPreview({
  title,
  teaser,
}: {
  title: string;
  teaser: string;
}) {
  return (
    <div className="bg-indigo rounded-2xl p-8 text-center text-ivory">
      <div className="text-xs uppercase tracking-[0.12em] text-gold font-semibold mb-3">
        for members
      </div>
      <h3 className="font-display text-xl mb-3">{title}</h3>
      <p className="text-sm text-ivory/75 mb-6 max-w-[420px] mx-auto">
        {teaser}
      </p>
      <Link
        href="/#pricing"
        className="inline-block text-sm font-semibold px-6 py-2.5 rounded-full bg-gold-deep text-ivory"
      >
        Join for ₹299/month
      </Link>
    </div>
  );
}
