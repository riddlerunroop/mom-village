// Shared rendering for a single month's Monthly Chart content — used by both
// the current-month dashboard view and the archive's per-month view, so a
// mother sees the exact same card layout whether she's looking at "now" or
// looking back. Six real categories, matching how the locked content was
// actually authored (not the original placeholder Money/Development/
// Environment scaffold).

export const CHART_SECTIONS = [
  { key: "baby_development", label: "Baby's Development", accent: "gold" as const },
  { key: "mum_wellbeing", label: "Mum's Wellbeing", accent: "terracotta" as const },
  { key: "buy_now", label: "Buy / Arrange Now", accent: "sage" as const },
  { key: "hold_off", label: "Hold Off On", accent: "gold" as const },
  { key: "movement_rest", label: "Movement & Rest", accent: "sage" as const },
  { key: "appointments_safety", label: "Appointments & Safety", accent: "terracotta" as const },
];

export type ChartContentItem = {
  id: string;
  section: string;
  body: string;
  sort_order: number | null;
};

export default function MonthlyChartGrid({ items }: { items: ChartContentItem[] }) {
  const bySection = CHART_SECTIONS.map((section) => ({
    ...section,
    items: items
      .filter((c) => c.section === section.key)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
  }));

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {bySection.map((section) => (
        <div
          key={section.key}
          className="bg-ivory-2 rounded-2xl border border-line p-6"
          style={{ borderTop: `3px solid var(--color-${section.accent})` }}
        >
          <h3 className="font-display text-lg text-indigo mb-3">{section.label}</h3>

          {section.items.length === 0 ? (
            <p className="text-sm text-ink/55 italic">
              Nothing for this section this month — check back soon.
            </p>
          ) : (
            <ul className="space-y-3">
              {section.items.map((item) => (
                <li key={item.id} className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    className="mt-1 shrink-0 accent-gold-deep"
                    disabled
                  />
                  <p className="text-sm text-ink/85 leading-snug">{item.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
