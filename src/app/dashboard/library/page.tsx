import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";
import { LIBRARY_BOOKS, getBookMeta, type LibraryBookMeta } from "@/lib/library";

function BookCard({ book, isSubscribed }: { book: LibraryBookMeta; isSubscribed: boolean }) {
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

  if (!isSubscribed) {
    return <div className="opacity-70">{card}</div>;
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

      {!isSubscribed && (
        <div className="mb-10">
          <LockedPreview
            title="All six books, included"
            teaser="Membership includes full access to every book — or buy any one individually without subscribing."
          />
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
            <BookCard key={b.slug} book={b} isSubscribed={isSubscribed} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-[0.1em] text-sage-deep font-bold mb-4">
          {parentingBooks[0].seriesLabel}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {parentingBooks.map((b) => (
            <BookCard key={b.slug} book={b} isSubscribed={isSubscribed} />
          ))}
        </div>
      </section>
    </main>
  );
}
