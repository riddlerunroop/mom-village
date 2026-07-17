export default function CarePage() {
  return (
    <main className="max-w-[900px] mx-auto px-6 py-10">
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold">
        this week, for you
      </div>
      <h1 className="font-display text-[30px] text-indigo mb-2">
        Your weekly care chart
      </h1>
      <p className="text-sm text-ink/65 mb-10 max-w-[540px]">
        Body, food, and mind — built around how you delivered and how far
        along you are. We're brewing your first week's chart right now.
      </p>
      <div className="bg-ivory-2 rounded-2xl border border-line p-8 text-center">
        <p className="font-display italic text-lg text-sage-deep">
          Check back soon — this space is being filled with care, not
          crunches.
        </p>
      </div>
    </main>
  );
}
