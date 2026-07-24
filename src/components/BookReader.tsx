"use client";

import { forwardRef, useMemo, useRef, useState } from "react";
import Link from "next/link";
import HTMLFlipBook from "react-pageflip";
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
    <div ref={ref} className="w-full h-full bg-ink">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cover} alt="Book cover" className="w-full h-full object-cover" />
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
}: {
  title: string;
  cover: string;
  pages: LibraryPage[];
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bookRef = useRef<HTMLFlipBook>(null);
  const [current, setCurrent] = useState(0);

  const totalLeaves = pages.length + 2; // cover + content pages + end page

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

  const handleFlip = (e: { data: number }) => {
    setCurrent(e.data);
    playTurn();
  };

  const goNext = () => {
    bookRef.current?.pageFlip().flipNext();
  };
  const goPrev = () => {
    bookRef.current?.pageFlip().flipPrev();
  };

  const bookElements = useMemo(() => {
    const els = [<CoverPage key="cover" cover={cover} />];
    pages.forEach((p, i) => {
      els.push(<ContentPage key={i} page={p} pageNumber={i + 1} />);
    });
    els.push(<EndPage key="end" title={title} />);
    return els;
  }, [pages, cover, title]);

  return (
    <div className="flex flex-col items-center">
      <audio ref={audioRef} src="/sounds/page-turn.mp3" preload="auto" />

      <div className="w-full max-w-[720px] flex items-center justify-between px-1 mb-3">
        <Link
          href="/dashboard/library"
          className="text-xs font-semibold text-ink/60 hover:text-ink px-3 py-1.5 rounded-full border border-line"
        >
          ← Shelf
        </Link>
        <div className="text-xs text-ink/50 font-semibold">
          {current === 0
            ? "Cover"
            : current > pages.length
            ? "The End"
            : `Page ${current} of ${pages.length}`}
        </div>
      </div>

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
