// New 2026-07-30 — audit finding #13 (Important). Dashboard-specific
// loading state, shown inside the existing dashboard shell (nav/footer
// still render immediately, since layout.tsx renders independently of
// this) while any dashboard page's data is being fetched.
export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 rounded-full border-[3px] border-gold-deep/25 border-t-gold-deep animate-spin" />
    </div>
  );
}
