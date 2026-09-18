"use client";

// Shared collapsible pillar-section card, built 2026-09-18 in response to
// Roop's live-review feedback on the Care Chart: every section (Move,
// Reset, Nourish, Hydration goal, Feeding comfort, Rest support, Care for
// yourself, Your corner, Support moment, Celebrate this week, Mental
// health & support) used to invent its own header size/layout — Move and
// Reset got a big hero title, the smaller WeekCard sections got a plain
// small title, and Nourish stacked two separate headers on top of each
// other. All of that now renders through this one component, so the
// header typography (eyebrow size, title size/weight, mantra style) is
// identical everywhere, and every section is collapsed by default with an
// independent expand/collapse toggle — clicking one section never opens or
// closes any other (her explicit call, 2026-09-18).
//
// Deliberately NOT a single outer <button> wrapping the whole header row:
// the optional "done" checkmark needs its own real <button>, and nested
// buttons are invalid HTML / break screen readers. The title area and the
// chevron are each their own button instead, sitting as siblings.

import { useState, type ReactNode } from "react";

export default function PillarCard({
  eyebrow,
  icon,
  title,
  subtitle,
  accent,
  doneButton,
  defaultOpen = false,
  done = false,
  children,
}: {
  eyebrow?: string;
  icon?: string;
  title: string;
  subtitle?: string;
  accent: string;
  doneButton?: ReactNode;
  defaultOpen?: boolean;
  done?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`rounded-2xl transition-colors ${done ? "bg-sage/10" : "bg-ivory-2"}`}
      style={{ borderTop: `3px solid var(--color-${accent})` }}
    >
      <div className="w-full flex items-start justify-between gap-3 px-5 py-4">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-start gap-3 min-w-0 text-left flex-1"
        >
          {icon && <span className="text-2xl leading-none shrink-0">{icon}</span>}
          <div className="min-w-0">
            {eyebrow && (
              <p
                className="text-[11px] font-semibold uppercase tracking-wide mb-0.5"
                style={{ color: `var(--color-${accent})` }}
              >
                {eyebrow}
              </p>
            )}
            <h3 className={`font-display text-lg ${done ? "text-ink/50 line-through decoration-1" : "text-indigo"}`}>
              {title}
            </h3>
            {subtitle && (
              <p className="font-display italic text-[14px] text-sage-deep mt-0.5">&ldquo;{subtitle}&rdquo;</p>
            )}
          </div>
        </button>
        <div className="flex items-center gap-2 shrink-0 pt-0.5">
          {doneButton}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Collapse" : "Expand"}
            className="text-ink/35 hover:text-ink/60 transition-colors px-1"
          >
            <span className={`inline-block transition-transform text-lg ${open ? "rotate-90" : ""}`} aria-hidden>
              ›
            </span>
          </button>
        </div>
      </div>
      {open && <div className="px-5 pb-5 -mt-1">{children}</div>}
    </div>
  );
}
