"use client";

// REACH — "Tell someone close" — new 2026-09-21, Phase 2 of the Maternal
// Mental Health / PPD+PPA integration (see CLAUDE.md). Pulled out of the
// plain ACTIONS list on this page into its own component because it needs
// real interaction (a generated, copyable message) rather than a static
// paragraph — Roop's own framing: "this might be one of the highest-value
// additions... it solves the awkward moment between 'something isn't right'
// and actually telling somebody." Nothing here is saved anywhere, same
// no-persistence principle as the Prepare page's script.

import { useState } from "react";

const MESSAGE =
  "I haven't been feeling like myself lately. I'm finding things harder " +
  "than usual and I don't want to brush it off. Can I talk to you about " +
  "it and can you help me get some support if I need it?";

export default function ReachSomeoneAction() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be unavailable — she can still select and copy manually
    }
  };

  return (
    <div className="bg-ivory-2 rounded-2xl border border-line p-5">
      <h2 className="font-display text-base text-indigo mb-1.5">Reach one person</h2>
      <p className="text-[13px] text-ink/70 leading-relaxed mb-3">
        You don&apos;t have to explain everything. A short, honest message
        is enough to start.
      </p>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-sm font-semibold text-terracotta underline"
      >
        {open ? "Hide the message" : "Get a message you can send →"}
      </button>
      {open && (
        <div className="mt-3 bg-ivory rounded-xl border border-line p-4">
          <p className="text-[13px] text-ink/70 mb-3">{MESSAGE}</p>
          <button
            type="button"
            onClick={handleCopy}
            className="text-sm font-semibold px-5 py-2 rounded-full bg-terracotta text-ivory"
          >
            {copied ? "Copied!" : "Copy this text"}
          </button>
        </div>
      )}
    </div>
  );
}
