import Link from "next/link";
import MarketingNav from "@/components/MarketingNav";

const sections = [
  {
    title: "The Emotional Gap in Financial Education",
    body: "Most students are told that money matters but not given tools that feel approachable. Traditional finance products often make beginners feel late, confused, or unqualified from day one."
  },
  {
    title: "Why StockSense Was Built",
    body: "StockSense exists to remove that first barrier. We translate market behavior into language students can understand and act on, without losing rigor."
  },
  {
    title: "What We Believe",
    body: "Financial confidence should be teachable. If a student can explain trend, risk, and momentum clearly, they can build stronger long-term habits and better judgment."
  },
  {
    title: "How This Supports Schools",
    body: "Educators get a consistent framework for classroom discussions, projects, and practical learning activities tied to real market behavior."
  }
];

const principles = [
  "Plain language over technical overload",
  "Interpretability over prediction hype",
  "Long-term growth mindset over short-term noise",
  "Student confidence as a measurable educational outcome"
];

export default function AboutPage() {
  return (
    <main className="cluely-shell min-h-screen text-white">
      <section className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-12">
        <MarketingNav compact />

        <div className="cluely-panel mt-8 rounded-3xl p-7 md:p-10">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-50/80">About StockSense</p>
          <h1 className="cluely-display mt-2 text-4xl font-medium leading-tight md:text-6xl">From a student perspective, financial learning should feel empowering, not exclusive.</h1>

          <p className="mt-5 max-w-3xl text-blue-50/85">
            This platform was shaped by a simple idea: when students can understand what they are seeing, they make better choices. StockSense is designed to build that understanding early.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {sections.map((item) => (
              <article key={item.title} className="rounded-2xl border border-[#cde4ff]/45 bg-[#eff7ff]/18 p-5">
                <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-blue-50/84">{item.body}</p>
              </article>
            ))}
          </div>

          <section className="mt-8 rounded-2xl border border-[#cde4ff]/45 bg-[#eff7ff]/18 p-6">
            <p className="text-sm uppercase tracking-[0.16em] text-blue-50/80">Core Principles</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {principles.map((item) => (
                <p key={item} className="rounded-xl border border-[#d2e6ff]/45 bg-[#f6fbff]/16 px-4 py-3 text-sm text-blue-50/86">
                  {item}
                </p>
              ))}
            </div>
          </section>

          <section className="cluely-panel-strong mt-8 rounded-2xl p-6">
            <h3 className="cluely-display text-3xl font-medium text-white">The mission is long-term student growth.</h3>
            <p className="mt-3 max-w-3xl text-blue-50/85">
              We are not building another overwhelming market terminal. We are building a learning environment that helps students practice clear thinking, risk awareness, and disciplined decision-making.
            </p>
          </section>

          <div className="mt-9 flex flex-wrap gap-3.5">
            <Link href="/dashboard" className="cluely-cta rounded-xl px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white">
              Experience StockSense
            </Link>
            <Link href="/contact" className="cluely-ghost rounded-xl px-5 py-3 text-sm font-semibold text-blue-50">
              Contact Our Team
            </Link>
            <Link href="/" className="cluely-ghost rounded-xl px-5 py-3 text-sm font-semibold text-blue-50">
              Back to Landing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
