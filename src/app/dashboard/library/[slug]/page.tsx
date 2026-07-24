import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import { getBookMeta } from "@/lib/library";
import LockedPreview from "@/components/LockedPreview";
import BookReader from "@/components/BookReader";
import type { LibraryBookContent } from "@/types/library-content";

// All six books now have their paginated content wired up — each was
// converted from its locked manuscript via the same docx -> HTML ->
// paginated-JSON pipeline built for the "Money, Understood" prototype.
const CONTENT_LOADERS: Record<string, () => Promise<{ default: unknown }>> = {
  "money-understood": () => import("@/content/library/money-understood.json"),
  "creating-your-own-opportunities": () =>
    import("@/content/library/creating-your-own-opportunities.json"),
  "building-your-financial-security": () =>
    import("@/content/library/building-your-financial-security.json"),
  "understanding-your-little-one": () =>
    import("@/content/library/understanding-your-little-one.json"),
  "guiding-your-growing-child": () =>
    import("@/content/library/guiding-your-growing-child.json"),
  "supporting-your-childs-growing-independence": () =>
    import("@/content/library/supporting-your-childs-growing-independence.json"),
};

async function loadContent(slug: string): Promise<LibraryBookContent | null> {
  const loader = CONTENT_LOADERS[slug];
  if (!loader) return null;
  const data = await loader();
  return data.default as unknown as LibraryBookContent;
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
