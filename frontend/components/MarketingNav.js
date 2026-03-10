import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/essentials?source=landing", label: "Essentials" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export default function MarketingNav({ compact = false }) {
  return (
    <header className="sticky top-4 z-30">
      <div className="cluely-nav rounded-2xl px-4 py-3 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#d6e8ff] bg-[#1f63cb]/70 text-[11px] font-bold text-white">
              SS
            </span>
            <span className="text-lg font-semibold tracking-tight text-white">StockSense</span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-blue-50/90 transition hover:bg-white/15 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {!compact ? (
              <Link
                href="/dashboard"
                className="cluely-cta rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition md:text-sm"
              >
                Experience StockSense
              </Link>
            ) : null}
            {compact ? (
              <Link
                href="/dashboard"
                className="cluely-cta rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition"
              >
                Dashboard
              </Link>
            ) : null}
          </div>
        </div>

        <nav className="mt-3 flex gap-2 md:hidden">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-[#d4e8ff]/50 bg-[#f0f7ff]/15 px-3 py-1.5 text-xs font-medium text-blue-50/95"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
