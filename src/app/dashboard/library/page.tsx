export default function LibraryPage() {
  return (
    <main className="max-w-[900px] mx-auto px-6 py-10">
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold">
        the library
      </div>
      <h1 className="font-display text-[30px] text-indigo mb-2">
        Your books
      </h1>
      <p className="text-sm text-ink/65 mb-10 max-w-[540px]">
        Three books on finance, three on parenting — free with your
        membership. Reading here, right in the app, is coming soon.
      </p>
      <div className="bg-ivory-2 rounded-2xl border border-line p-8 text-center">
        <p className="font-display italic text-lg text-sage-deep">
          Your shelf is being stocked.
        </p>
      </div>
    </main>
  );
}
