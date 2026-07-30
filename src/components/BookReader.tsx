"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import HTMLFlipBook from "react-pageflip";
import { createClient } from "@/lib/supabase/client";
import type { LibraryBlock, LibraryPage } from "@/types/library-content";

function Block({ block }: { block: LibraryBlock }) {
  switch (block.type) {
    case "h":
      return (
        <h4 className="font-display text-[15px] text-indigo mt-3 mb-1.5 leading-snug">
          {block.text}
        </h4>
      );
    case "list":
      return block.ordered ? (
        <ol className="list-decimal pl-4 text-[12.5px] leading-[1.55] text-ink/90 space-y-1 my-2">
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ol>
      ) : (
        <ul className="list-disc pl-4 text-[12.5px] leading-[1.55] text-ink/90 space-y-1 my-2">
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );
    case "box":
      return (
        <div className="my-2.5 rounded-lg bg-ivory-2 border border-line px-3 py-2.5">
          {block.label && (
            <div className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-sage-deep mb-1">
              {block.label}
            </div>
          )}
          <div className="text-[12px] leading-[1.5] text-ink/90">{block.text}</div>
        </div>
      );
    case "table":
      return (
        <div className="my-2.5 overflow-hidden rounded-lg border border-line">
          <table className="w-full text-[10.5px] leading-tight border-collapse">
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className={ri === 0 ? "bg-ivory-2" : "odd:bg-transparent even:bg-ivory-2/40"}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-2 py-1.5 align-top border-b border-line ${
                        ri === 0 ? "font-semibold text-indigo" : "text-ink/85"
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "p":
    default:
      return (
        <p className="text-[12.5px] leading-[1.6] text-ink/90 my-1.5 first:mt-0">
          {block.text}
        </p>
      );
  }
}

const ContentPage = forwardRef<HTMLDivElement, { page: LibraryPage; pageNumber: number }>(
  function ContentPage({ page, pageNumber }, ref) {
    return (
      <div
        ref={ref}
        className="bg-ivory w-full h-full flex flex-col px-6 py-7 overflow-hidden"
        style={{ boxShadow: "inset 0 0 24px rgba(43,36,32,0.05)" }}
      >
        {page.isChapterStart && (
          <div className="mb-3">
            <div className="text-[10px] uppercase tracking-[0.14em] text-gold-deep font-bold mb-1">
              Chapter {page.chapterNumber}
            </div>
            <h3 className="font-display text-[19px] text-indigo leading-tight mb-1.5">
              {page.chapterTitle}
            </h3>
            {page.epigraph && (
              <p className="text-[11.5px] italic text-sage-deep leading-snug mb-1">
                {page.epigraph}
              </p>
            )}
            <div className="w-8 h-[2px] bg-gold mt-2 mb-1" />
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          {page.blocks.map((b, i) => (
            <Block key={i} block={b} />
          ))}
        </div>
        <div className="pt-2 text-center text-[10px] text-ink/40 font-semibold">
          {pageNumber}
        </div>
      </div>
    );
  }
);

const CoverPage = forwardRef<HTMLDivElement, { cover: string }>(function CoverPage(
  { cover },
  ref
) {
  return (
    <div ref={ref} className="relative w-full h-full bg-ink">
      <Image src={cover} alt="Book cover" fill sizes="400px" className="object-cover" priority />
    </div>
  );
});

const EndPage = forwardRef<HTMLDivElement, { title: string }>(function EndPage(
  { title },
  ref
) {
  return (
    <div
      ref={ref}
      className="bg-ivory w-full h-full flex flex-col items-center justify-center px-8 text-center"
    >
      <div className="w-10 h-[2px] bg-gold mb-4" />
      <p className="font-display italic text-[15px] text-sage-deep mb-2">
        You&apos;ve reached the end of
      </p>
      <h3 className="font-display text-[19px] text-indigo mb-4">{title}</h3>
      <p className="text-[11.5px] text-ink/60 max-w-[220px]">
        With love, Mom&apos;s Village
      </p>
    </div>
  );
});

export default function BookReader({
  title,
  cover,
  pages,
  bookSlug,
  initialPage = 0,
}: {
  title: string;
  cover: string;
  pages: LibraryPage[];
  bookSlug: string;
  initialPage?: number;
}) {
  const supabase = useMemo(() => createClient(), []);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bookRef = useRef<HTMLFlipBook>(null);
  const [current, setCurrent] = useState(initialPage);
  const [showResumeNote, setShowResumeNote] = useState(initialPage > 0);
  const [showContents, setShowContents] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalLeaves = pages.length + 2; // cover + content pages + end page

  // Table of contents — derived straight from the same page data the
  // reader already has, so it can never drift out of sync with the real
  // chapter breaks. Leaf index = pages-array index + 1 (leaf 0 is the cover).
  const chapters = useMemo(
    () =>
      pages
        .map((p, i) => ({ ...p, leaf: i + 1 }))
        .filter((p) => p.isChapterStart),
    [pages]
  );

  useEffect(() => {
    async function loadBookmarks() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_book_bookmarks")
        .select("page_index")
        .eq("user_id", user.id)
        .eq("book_slug", bookSlug);
      setBookmarks(new Set((data || []).map((r) => r.page_index)));
    }
    loadBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookSlug]);

  const playTurn = () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      a.currentTime = 0;
      void a.play();
    } catch {
      // autoplay restrictions — silently ignore, the flip still works
    }
  };

  // Debounced save so flipping quickly through several pages doesn't fire a
  // write per page — only the position she settles on gets saved, about
  // 700ms after her last flip.
  const saveProgress = (pageIndex: number) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("user_reading_progress").upsert(
        {
          user_id: user.id,
          book_slug: bookSlug,
          page_index: pageIndex,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,book_slug" }
      );
    }, 700);
  };

  const handleFlip = (e: { data: number }) => {
    setCurrent(e.data);
    setShowResumeNote(false);
    playTurn();
    saveProgress(e.data);
  };

  const goNext = () => {
    bookRef.current?.pageFlip().flipNext();
  };
  const goPrev = () => {
    bookRef.current?.pageFlip().flipPrev();
  };
  const jumpTo = (leaf: number) => {
    bookRef.current?.pageFlip().flip(leaf);
    setShowContents(false);
  };

  async function toggleBookmark() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const isBookmarked = bookmarks.has(current);
    const next = new Set(bookmarks);
    if (isBookmarked) {
      next.delete(current);
      setBookmarks(next);
      await supabase
        .from("user_book_bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("book_slug", bookSlug)
        .eq("page_index", current);
    } else {
      next.add(current);
      setBookmarks(next);
      await supabase
        .from("user_book_bookmarks")
        .upsert(
          { user_id: user.id, book_slug: bookSlug, page_index: current },
          { onConflict: "user_id,book_slug,page_index" }
        );
    }
  }

  const bookElements = useMemo(() => {
    const els = [<CoverPage key="cover" cover={cover} />];
    pages.forEach((p, i) => {
      els.push(<ContentPage key={i} page={p} pageNumber={i + 1} />);
    });
    els.push(<EndPage key="end" title={title} />);
    return els;
  }, [pages, cover, title]);

  const isContentPage = current >= 1 && current <= pages.length;
  const sortedBookmarks = Array.from(bookmarks).sort((a, b) => a - b);

  return (
    <div className="flex flex-col items-center">
      <audio ref={audioRef} src="/sounds/page-turn.mp3" preload="auto" />

      <div className="w-full max-w-[720px] flex items-center justify-between px-1 mb-2 gap-2">
        <Link
          href="/dashboard/library"
          className="text-xs font-semibold text-ink/60 hover:text-ink px-3 py-1.5 rounded-full border border-line shrink-0"
        >
          ← Shelf
        </Link>
        <div className="flex items-center gap-2">
          {isContentPage && (
            <button
              type="button"
              onClick={toggleBookmark}
              aria-label={bookmarks.has(current) ? "Remove bookmark" : "Bookmark this page"}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                bookmarks.has(current)
                  ? "bg-gold-deep border-gold-deep text-ivory"
                  : "border-line text-ink/60 hover:text-ink"
              }`}
            >
              {bookmarks.has(current) ? "★ Bookmarked" : "☆ Bookmark"}
            </button>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowContents((s) => !s)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-line text-ink/60 hover:text-ink"
            >
              Contents
            </button>
            {showContents && (
              <div className="absolute right-0 top-full mt-1.5 w-72 max-h-[360px] overflow-y-auto bg-ivory rounded-xl border border-line shadow-lg z-30 py-2">
                {sortedBookmarks.length > 0 && (
                  <div className="px-3 pb-2 mb-1 border-b border-line">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-gold-deep mb-1.5">
                      Your bookmarks
                    </p>
                    {sortedBookmarks.map((leaf) => (
                      <button
                        key={leaf}
                        type="button"
                        onClick={() => jumpTo(leaf)}
                        className="block w-full text-left text-[12px] text-ink/75 hover:text-gold-deep py-1"
                      >
                        ★ Page {leaf}
                      </button>
                    ))}
                  </div>
                )}
                <p className="px-3 text-[10px] uppercase tracking-wide font-bold text-sage-deep mb-1">
                  Chapters
                </p>
                {chapters.map((c) => (
                  <button
                    key={c.leaf}
                    type="button"
                    onClick={() => jumpTo(c.leaf)}
                    className="block w-full text-left px-3 py-1.5 text-[12.5px] text-ink/80 hover:bg-ivory-2 hover:text-indigo"
                  >
                    <span className="text-ink/40 mr-1.5">{c.chapterNumber}.</span>
                    {c.chapterTitle}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-[720px] px-1 mb-3">
        <div className="h-1 rounded-full bg-ivory-2 overflow-hidden">
          <div
            className="h-full bg-gold-deep rounded-full transition-all"
            style={{ width: `${Math.min(100, (current / totalLeaves) * 100)}%` }}
          />
        </div>
        <div className="text-[11px] text-ink/45 font-semibold mt-1 text-center">
          {current === 0
            ? "Cover"
            : current > pages.length
            ? "The End"
            : `Page ${current} of ${pages.length}`}
        </div>
      </div>

      {showResumeNote && (
        <p className="text-[11px] text-sage-deep font-semibold mb-2">
          Picking up where you left off
        </p>
      )}

      <div className="relative select-none">
        <HTMLFlipBook
          ref={bookRef}
          width={340}
          height={500}
          size="stretch"
          minWidth={260}
          maxWidth={420}
          minHeight={380}
          maxHeight={620}
          showCover={true}
          drawShadow={true}
          flippingTime={550}
          maxShadowOpacity={0.4}
          mobileScrollSupport={false}
          useMouseEvents={true}
          className="library-flipbook"
          style={{}}
          startPage={initialPage}
          onFlip={handleFlip}
        >
          {bookElements}
        </HTMLFlipBook>

        <button
          onClick={goPrev}
          aria-label="Previous page"
          className="hidden md:flex absolute left-[-52px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ivory border border-line items-center justify-center text-indigo hover:bg-ivory-2"
        >
          ‹
        </button>
        <button
          onClick={goNext}
          aria-label="Next page"
          className="hidden md:flex absolute right-[-52px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ivory border border-line items-center justify-center text-indigo hover:bg-ivory-2"
        >
          ›
        </button>
      </div>

      <div className="flex md:hidden gap-4 mt-4">
        <button
          onClick={goPrev}
          className="px-5 py-2 rounded-full bg-ivory border border-line text-sm font-semibold text-indigo"
        >
          ‹ Prev
        </button>
        <button
          onClick={goNext}
          className="px-5 py-2 rounded-full bg-ivory border border-line text-sm font-semibold text-indigo"
        >
          Next ›
        </button>
      </div>

      <p className="text-[11px] text-ink/40 mt-4 max-w-[320px] text-center">
        Tap the edge of a page, or swipe, to turn it — {totalLeaves} pages in this
        edition.
      </p>
    </div>
  );
}
