import Link from "next/link";
import SubscribeButton from "./SubscribeButton";

// `loggedIn` added 2026-07-30 (Razorpay integration): a logged-in mother
// who isn't subscribed yet gets a real checkout button right here — no
// reason to send her back to the homepage first. A logged-out visitor
// (e.g. someone who followed a direct link while signed out — shouldn't
// normally reach a LockedPreview at all, since every gated page redirects
// guests to /login first, but this is a safe fallback) still gets sent to
// the homepage pricing section instead, since starting checkout requires
// an authenticated session.
export default function LockedPreview({
  title,
  teaser,
  loggedIn = true,
  children,
}: {
  title: string;
  teaser: string;
  loggedIn?: boolean;
  children?: React.ReactNode;
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
      {loggedIn ? (
        <SubscribeButton />
      ) : (
        <Link
          href="/#pricing"
          className="inline-block text-sm font-semibold px-6 py-2.5 rounded-full bg-gold-deep text-ivory"
        >
          Join for ₹299/month
        </Link>
      )}
      {children && <div className="mt-5 pt-5 border-t border-ivory/15">{children}</div>}
    </div>
  );
}
