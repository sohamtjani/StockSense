import Link from "next/link";
import MarketingNav from "@/components/MarketingNav";

const pillars = [
  {
    title: "Clarity First",
    body: "Students get plain-language signals instead of financial jargon and dashboard clutter."
  },
  {
    title: "Confidence Through Structure",
    body: "Every stock view answers trend, risk, and attention with a consistent, teachable framework."
  },
  {
    title: "Built for Education",
    body: "Designed for high school, college, and edtech programs focused on long-term financial literacy."
  }
];

const metrics = [
  { value: "3", label: "Core Questions answered instantly" },
  { value: "10", label: "Educational chart toggles" },
  { value: "0", label: "Login friction for students" },
  { value: "1", label: "Unified student-first workflow" }
];

const featureRows = [
  {
    title: "Beginner-first stock analysis",
    summary: "Simplified bullish/bearish scoring so students understand direction without decoding advanced technical language."
  },
  {
    title: "Interactive chart learning mode",
    summary: "A guided indicator lab where students can turn concepts on/off and learn what each one means for short and long horizons."
  },
  {
    title: "Context-rich market explanation",
    summary: "Students see why investors are paying attention right now, paired with a clear risk and momentum story."
  },
  {
    title: "Built for instructional settings",
    summary: "Designed to work for classrooms, clubs, and edtech pilots where clarity, consistency, and explainability matter."
  }
];

const useCases = [
  {
    title: "High School Finance Programs",
    body: "Use StockSense in class discussions to help students connect market events with practical financial literacy skills."
  },
  {
    title: "College Intro Investing Clubs",
    body: "Give beginners a common framework so meetings focus on reasoning and discipline instead of noise."
  },
  {
    title: "EdTech Product Integrations",
    body: "Embed a modern, student-friendly market experience into broader career readiness and personal finance products."
  }
];

const faq = [
  {
    q: "Is this designed for advanced traders?",
    a: "No. StockSense is built for students and educators who need understandable market interpretation, not high-frequency trading workflows."
  },
  {
    q: "Does this replace a full broker platform?",
    a: "No. It is a learning and interpretation layer that helps users build confidence before making real-world decisions."
  },
  {
    q: "Can schools use this as part of curriculum?",
    a: "Yes. The product is intentionally structured for classroom discussion, student projects, and introductory investing education."
  }
];

export default function LandingPage() {
  return (
    <main className="cluely-shell relative min-h-screen overflow-hidden text-white">
      <div className="marketing-aurora" aria-hidden="true">
        <span className="marketing-orb orb-a" />
        <span className="marketing-orb orb-b" />
        <span className="marketing-orb orb-c" />
      </div>

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <MarketingNav />

        <header className="cluely-panel mb-14 mt-8 rounded-2xl px-5 py-5 md:px-7">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-blue-50/80">StockSense</p>
            <h1 className="text-xl font-semibold tracking-tight text-white md:text-2xl">Student Financial Intelligence Platform</h1>
          </div>
        </header>

        <div className="grid items-stretch gap-6 lg:grid-cols-12">
          <section className="cluely-panel-strong rounded-3xl p-7 lg:col-span-7 md:p-10">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-50/80">For EdTech, Schools, and Student Programs</p>
            <h2 className="cluely-display mt-3 text-5xl font-medium leading-[1.03] text-white md:text-7xl">
              Financial education should feel clear, calm, and actionable.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-blue-50/88 md:text-lg">
              StockSense gives students a professional market experience without the confusion of traditional finance tools. It translates complex signals into plain language, reduces intimidation, and helps learners build real long-term literacy.
            </p>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link
                href="/dashboard"
                className="cluely-cta rounded-xl px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition"
              >
                Experience StockSense
              </Link>
              <Link href="/about" className="cluely-ghost rounded-xl px-5 py-3 text-sm font-semibold text-blue-50">
                Why this matters
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((item) => (
                <article key={item.label} className="rounded-xl border border-[#c7e0ff]/45 bg-[#f2f8ff]/14 p-4">
                  <p className="text-2xl font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-sm text-blue-50/86">{item.label}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="cluely-panel overflow-hidden rounded-3xl lg:col-span-5">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80"
              alt="Students collaborating in a learning environment"
              className="h-64 w-full object-cover opacity-92 md:h-72"
              loading="lazy"
            />
            <div className="p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-50/80">Public Image Asset</p>
              <p className="mt-2 text-base leading-relaxed text-white">
                A product experience designed for institutions that want measurable student confidence in financial decision-making.
              </p>
              <p className="mt-3 text-xs text-blue-50/70">Image source: Unsplash (free-to-use public license).</p>
            </div>
          </section>
        </div>

        <section className="cluely-panel mt-8 rounded-3xl p-7 md:p-9">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-50/80">Why This Model Works for Student Learning</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {pillars.map((item) => (
              <article key={item.title} className="rounded-2xl border border-[#cde4ff]/45 bg-[#eff7ff]/18 p-5">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-blue-50/84">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cluely-panel mt-8 rounded-3xl p-7 md:p-9">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-50/80">Product Capabilities</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {featureRows.map((item) => (
              <article key={item.title} className="rounded-2xl border border-[#cde4ff]/45 bg-[#eff7ff]/18 p-5">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-blue-50/84">{item.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cluely-panel mt-8 rounded-3xl p-7 md:p-9">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-50/80">Where Teams Use StockSense</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {useCases.map((item) => (
              <article key={item.title} className="rounded-2xl border border-[#cde4ff]/45 bg-[#eff7ff]/18 p-5">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-blue-50/84">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cluely-panel mt-8 rounded-3xl p-7 md:p-9">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-50/80">Frequently Asked Questions</p>
          <div className="mt-5 space-y-3">
            {faq.map((item) => (
              <article key={item.q} className="rounded-xl border border-[#cfe4ff]/42 bg-[#15396d]/52 p-5">
                <h3 className="cluely-readable text-base font-semibold">{item.q}</h3>
                <p className="cluely-readable mt-2 text-sm">{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cluely-panel-strong mt-8 rounded-3xl p-7 md:p-9">
          <h3 className="cluely-display text-3xl font-medium text-white md:text-4xl">Ready to give students a clearer path into markets?</h3>
          <p className="mt-3 max-w-2xl text-blue-50/85">
            Start with the live StockSense experience and see how student-first design can transform financial literacy outcomes.
          </p>
          <div className="mt-6 flex flex-wrap gap-3.5">
            <Link
              href="/dashboard"
              className="cluely-cta rounded-xl px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition"
            >
              Experience StockSense
            </Link>
            <Link href="/contact" className="cluely-ghost rounded-xl px-5 py-3 text-sm font-semibold text-blue-50">
              Contact the Team
            </Link>
          </div>
        </section>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d0e5ff]/45 bg-[#143a70]/45 px-4 py-4 text-sm text-white">
          <p>StockSense 2026</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/about" className="text-blue-50/95 underline-offset-4 hover:text-white hover:underline">About</Link>
            <Link href="/contact" className="text-blue-50/95 underline-offset-4 hover:text-white hover:underline">Contact</Link>
            <Link href="/dashboard" className="text-blue-50/95 underline-offset-4 hover:text-white hover:underline">Experience</Link>
          </div>
        </footer>
      </section>
    </main>
  );
}
