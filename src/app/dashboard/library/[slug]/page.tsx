import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import { getBookMeta } from "@/lib/library";
import LockedPreview from "@/components/LockedPreview";
import BookReader from "@/components/BookReader";
import type { LibraryBookContent } from "@/types/library-content";

// Only "Money, Understood" has its paginated content wired up so far —
// this is the flip-book reader prototype. The other five books will be
// added here the same way once the format is approved.
async function loadContent(slug: string): Promise<LibraryBookContent | null> {
  if (slug === "money-understood") {
    const data = await import("@/content/library/money-understood.json");
    return data.default as unknown as LibraryBookContent;
  }
  return null;
}

export default async function LibraryBookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = getBookMeta(slug);
  if (!meta) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  if (!isSubscribed) {
    return (
      <main className="max-w-[900px] mx-auto px-6 py-10">
        <LockedPreview
          title={meta.title}
          teaser="Membership includes full access to every book in the Library — or buy this one individually without subscribing."
        />
      </main>
    );
  }

  const content = meta.hasReader ? await loadContent(slug) : null;

  if (!content) {
    return (
      <main className="max-w-[900px] mx-auto px-6 py-10 text-center">
        <div className="bg-ivory-2 rounded-2xl border border-line p-10">
          <p className="font-display italic text-lg text-sage-deep mb-2">
            {meta.title}
          </p>
          <p className="text-sm text-ink/60">
            This book&apos;s in-app reader is being prepared and will be ready
            to open soon.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[900px] mx-auto px-6 py-8">
      <BookReader title={meta.title} cover={meta.cover} pages={content.pages} />
    </main>
  );
}
