"use client";

// Filterable rendering of the Government Benefits & Savings Directory, per
// Roop's 2026-07-28 review: filters by stage, employment type, and whether
// a scheme's rules stay the same nationwide or can vary by state, plus a
// "may apply to me" toggle. Honest about what it can and can't know: we
// don't collect her employment type or state anywhere in the app today, so
// "may apply to me" auto-applies the one thing we DO know — her current
// pregnancy/postpartum/early-childhood stage, computed from her profile —
// and leaves employment/state as her own manual pick rather than faking
// personalization we don't have the data for.

import { useState } from "react";
import { Section, EntryCard } from "@/components/ContentDoc";

export type Stage = "pregnancy" | "postpartum" | "early_childhood";
export type Employment = "any" | "organized" | "unorganized";
export type Scope = "national" | "national_state_variation";

export type SchemeData = {
  title: string;
  who: string;
  what: string;
  how: string;
  link: string;
  linkLabel: string;
  stages: Stage[];
  employment: Employment;
  scope: Scope;
};

export type SchemeSection = { title: string; schemes: SchemeData[] };

const STAGE_LABELS: Record<Stage, string> = {
  pregnancy: "Pregnancy",
  postpartum: "First year",
  early_childhood: "1–6 years",
};

const EMPLOYMENT_LABELS: Record<Exclude<Employment, "any">, string> = {
  organized: "Organized-sector employee",
  unorganized: "Unorganized, self-employed, or not currently working",
};

export default function SchemesFilterList({
  sections,
  currentStage,
}: {
  sections: SchemeSection[];
  currentStage: Stage | null;
}) {
  const [stageFilter, setStageFilter] = useState<Stage | "all">("all");
  const [employmentFilter, setEmploymentFilter] = useState<Employment>("any");
  const [scopeFilter, setScopeFilter] = useState<Scope | "all">("all");
  const [onlyMine, setOnlyMine] = useState(false);

  const effectiveStage: Stage | "all" = onlyMine && currentStage ? currentStage : stageFilter;

  function matches(scheme: SchemeData): boolean {
    if (effectiveStage !== "all" && !scheme.stages.includes(effectiveStage)) return false;
    if (employmentFilter !== "any" && scheme.employment !== "any" && scheme.employment !== employmentFilter) return false;
    if (scopeFilter !== "all" && scheme.scope !== scopeFilter) return false;
    return true;
  }

  return (
    <div>
      <div className="bg-ivory-2 rounded-2xl border border-line p-5 mb-8">
        <p className="text-xs uppercase tracking-wide font-semibold text-sage-deep mb-3">
          Filter the directory
        </p>

        <label className="flex items-center gap-2.5 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyMine}
            onChange={(e) => setOnlyMine(e.target.checked)}
            disabled={!currentStage}
            className="accent-gold-deep"
          />
          <span className="text-sm font-semibold text-ink">
            Show only what may apply to me
          </span>
        </label>
        {onlyMine && (
          <p className="text-[11px] text-ink/50 -mt-2.5 mb-4 ml-6">
            Based on your current stage only — we don&apos;t know your
            employment type or state, so double-check those filters below
            too.
          </p>
        )}

        <div className="mb-3.5">
          <p className="text-[11px] font-semibold text-ink/50 uppercase tracking-wide mb-1.5">Stage</p>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "pregnancy", "postpartum", "early_childhood"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setStageFilter(s); setOnlyMine(false); }}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  effectiveStage === s
                    ? "bg-sage-deep text-ivory border-sage-deep"
                    : "text-sage-deep border-sage-deep/40"
                }`}
              >
                {s === "all" ? "All stages" : STAGE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3.5">
          <p className="text-[11px] font-semibold text-ink/50 uppercase tracking-wide mb-1.5">Employment type</p>
          <div className="flex flex-wrap gap-1.5">
            {(["any", "organized", "unorganized"] as const).map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmploymentFilter(e)}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  employmentFilter === e
                    ? "bg-terracotta text-ivory border-terracotta"
                    : "text-terracotta border-terracotta/40"
                }`}
              >
                {e === "any" ? "All" : EMPLOYMENT_LABELS[e]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-ink/50 uppercase tracking-wide mb-1.5">State</p>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "national", "national_state_variation"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScopeFilter(s)}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  scopeFilter === s
                    ? "bg-gold-deep text-ivory border-gold-deep"
                    : "text-gold-deep border-gold-deep/40"
                }`}
              >
                {s === "all" ? "All" : s === "national" ? "Same everywhere" : "Rules vary by state"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {sections.map((section) => {
        const visible = section.schemes.filter(matches);
        if (visible.length === 0) return null;
        return (
          <Section key={section.title} title={section.title}>
            {visible.map((scheme) => (
              <EntryCard
                key={scheme.title}
                title={scheme.title}
                who={scheme.who}
                what={scheme.what}
                how={scheme.how}
                link={scheme.link}
                linkLabel={scheme.linkLabel}
              />
            ))}
          </Section>
        );
      })}

      {sections.every((section) => section.schemes.filter(matches).length === 0) && (
        <div className="bg-ivory-2 rounded-2xl border border-line p-6 text-center text-sm text-ink/55 italic mb-8">
          Nothing matches that combination — try widening a filter.
        </div>
      )}
    </div>
  );
}
