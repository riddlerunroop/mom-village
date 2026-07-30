import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";
import BuyButton from "@/components/BuyButton";
import { LIBRARY_BOOKS, getBookMeta, type LibraryBookMeta } from "@/lib/library";

function BookCard({ book, unlocked }: { book: LibraryBookMeta; unlocked: boolean }) {
  const card = (
    <div className="group">
      <div className="relative aspect-[0.773] rounded-lg overflow-hidden border border-line shadow-sm bg-ink">
        <Image
          src={book.cover}
          alt={book.title}
          fill
          sizes="(max-width: 640px) 33vw, 200px"
          className="object-cover transition-transform group-hover:scale-[1.02]"
        />
        {!book.hasReader && (
          <div className="absolute bottom-0 inset-x-0 bg-ink/70 text-ivory text-[9px] uppercase tracking-[0.1em] font-semibold text-center py-1">
            Reader coming soon
          </div>
        )}
      </div>
      <p className="font-display text-[13px] text-indigo mt-2 leading-snug">
        {book.title}
      </p>
      <p className="text-[11px] text-ink/55 mt-0.5 leading-snug">
        {book.tagline}
      </p>
    </div>
  );

  if (!unlocked) {
    return (
      <div>
        <div className="opacity-70">{card}</div>
        <BuyButton
          type="book"
          slug={book.slug}
          label="Buy for ₹249"
          className="mt-2 [&_button]:w-full [&_button]:text-[11px] [&_button]:px-3 [&_button]:py-1.5"
        />
      </div>
    );
  }

  return (
    <Link href={`/dashboard/library/${book.slug}`} className="block">
      {card}
    </Link>
  );
}

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  // Individual/bundle book purchases (Razorpay integration, 2026-07-30) —
  // only matters for non-subscribers, membership already includes
  // everything. One query for all her paid purchases, rather than a
  // separate hasPurchasedBook() round-trip per book.
  let hasBundle = false;
  let purchasedSlugs = new Set<string>();
  if (!isSubscribed) {
    const { data: purchases } = await supabase
      .from("user_book_purchases")
      .select("book_slug, is_bundle")
      .eq("user_id", user!.id)
      .eq("status", "paid");
    hasBundle = (purchases || []).some((p) => p.is_bundle);
    purchasedSlugs = new Set((purchases || []).filter((p) => p.book_slug).map((p) => p.book_slug as string));
  }
  const isUnlocked = (slug: string) => isSubscribed || hasBundle || purchasedSlugs.has(slug);

  const wealthBooks = LIBRARY_BOOKS.filter((b) => b.series === "wealth");
  const parentingBooks = LIBRARY_BOOKS.filter((b) => b.series === "parenting");

  // "Continue reading" — surface whatever she's already partway through so
  // she doesn't have to hunt for it on the shelf, per Roop's 2026-07-28
  // review. Most-recently-read first, capped at 3.
  let inProgress: { slug: string; title: string; cover: string; pageIndex: number }[] = [];
  if (isSubscribed) {
    const { data: progressRows } = await supabase
      .from("user_reading_progress")
      .select("book_slug, page_index, updated_at")
      .eq("user_id", user!.id)
      .gt("page_index", 0)
      .order("updated_at", { ascending: false })
      .limit(3);

    inProgress = (progressRows || [])
      .map((r) => {
        const meta = getBookMeta(r.book_slug);
        return meta ? { slug: meta.slug, title: meta.title, cover: meta.cover, pageIndex: r.page_index } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }

  return (
    <main className="max-w-[900px] mx-auto px-6 py-10">
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold">
        the library
      </div>
      <h1 className="font-display text-[30px] text-indigo mb-2">Your books</h1>
      <p className="text-sm text-ink/65 mb-8 max-w-[540px]">
        Three books on finance, three on parenting. Included with your
        membership, readable right here in the app.
      </p>

      {!isSubscribed && !hasBundle && (
        <div className="mb-10">
          <LockedPreview
            title="All six books, included"
            teaser="Membership includes full access to every book — or buy any one individually below, or all six as a bundle."
          >
            <p className="text-xs text-ivory/70 mb-3">Just want the books?</p>
            <BuyButton
              type="bundle"
              label="Buy all six for ₹849"
              className="inline-block [&_button]:bg-ivory/10 [&_button]:border-ivory/40 [&_button]:text-ivory"
            />
          </LockedPreview>
        </div>
      )}

      {inProgress.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-[0.1em] text-terracotta font-bold mb-4">
            Continue reading
          </h2>
          <div className="flex flex-wrap gap-3">
            {inProgress.map((b) => (
              <Link
                key={b.slug}
                href={`/dashboard/library/${b.slug}`}
                className="flex items-center gap-3 bg-ivory-2 rounded-xl border border-line pr-4 hover:border-terracotta/40 transition-colors"
              >
                <div className="relative w-11 h-14 rounded-l-xl overflow-hidden bg-ink shrink-0">
                  <Image src={b.cover} alt={b.title} fill sizes="44px" className="object-cover" />
                </div>
                <div className="py-2">
                  <p className="text-[12.5px] font-semibold text-indigo leading-snug max-w-[160px]">
                    {b.title}
                  </p>
                  <p className="text-[10.5px] text-terracotta font-semibold mt-0.5">
                    Continue →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-[0.1em] text-gold-deep font-bold mb-4">
          {wealthBooks[0].seriesLabel}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {wealthBooks.map((b) => (
            <BookCard key={b.slug} book={b} unlocked={isUnlocked(b.slug)} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-[0.1em] text-sage-deep font-bold mb-4">
          {parentingBooks[0].seriesLabel}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {parentingBooks.map((b) => (
            <BookCard key={b.slug} book={b} unlocked={isUnlocked(b.slug)} />
          ))}
        </div>
      </section>
    </main>
  );
}
