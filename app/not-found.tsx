import Link from "next/link";

export default function NotFound() {
  return (
    <main className="section-shell py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest">404</p>
      <h1 className="mt-3 font-display text-4xl text-ink">Yeh page nahi mila</h1>
      <p className="mt-2 text-sm text-stone">Shayad URL galat hai ya page remove ho gaya</p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-forest px-6 py-3 text-sm font-bold text-white"
        aria-label="Go to homepage"
      >
        Homepage par wapas jao
      </Link>
    </main>
  );
}