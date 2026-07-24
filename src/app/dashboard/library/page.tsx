import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";
import { LIBRARY_BOOKS, type LibraryBookMeta } from "@/lib/library";

function BookCard({ book, isSubscribed }: { book: LibraryBookMeta; isSubscribed: boolean }) {
  const card = (
    <div className="group">
      <div className="relative aspect-[0.773] rounded-lg overflow-hidden border border-line shadow-sm bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={book.cover}
          alt={book.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
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
