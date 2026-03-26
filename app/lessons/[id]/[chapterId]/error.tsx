"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="section-shell">
      <div className="surface-card p-8 text-center">
        <h2 className="font-display text-2xl text-ink">Kuch gadbad ho gayi</h2>
        <p className="mt-2 text-sm text-stone">Page load nahi hua - dobara try karo</p>
        <button
          onClick={reset}
          className="mt-6 rounded-full bg-forest px-6 py-3 text-sm font-bold text-white"
          aria-label="Retry loading the page"
        >
          Dobara Try Karo
        </button>
      </div>
    </main>
  );
}