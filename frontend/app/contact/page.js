import Link from "next/link";
import MarketingNav from "@/components/MarketingNav";

const inquiryTypes = [
  {
    title: "School & District Pilots",
    body: "For administrators and educators exploring student-centered financial literacy programs."
  },
  {
    title: "EdTech Partnerships",
    body: "For product and curriculum teams looking to integrate StockSense into broader learning pathways."
  },
  {
    title: "Student Organizations",
    body: "For clubs and university groups seeking practical tools for beginner investing education."
  }
];

const responseInfo = [
  "Typical response time: within 1-2 business days",
  "Best first message: who you are, your program size, and what outcome you want",
  "We welcome feedback from students, educators, and operators"
];

export default function ContactPage() {
  return (
    <main className="cluely-shell min-h-screen text-white">
      <section className="mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-12">
        <MarketingNav compact />

        <div className="cluely-panel mt-8 rounded-3xl p-7 md:p-10">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-50/80">Contact</p>
          <h1 className="cluely-display mt-2 text-4xl font-medium leading-tight md:text-5xl">Bring StockSense to your school, classroom, or education program.</h1>
          <p className="mt-4 max-w-3xl text-blue-50/84">
            We are building StockSense for students, teachers, and education-focused teams that want practical, confidence-building financial learning experiences.
          </p>

          <section className="mt-8 grid gap-4 md:grid-cols-3">
            {inquiryTypes.map((item) => (
              <article key={item.title} className="rounded-2xl border border-[#cde4ff]/45 bg-[#eff7ff]/18 p-5">
                <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-2 text-sm text-blue-50/84">{item.body}</p>
              </article>
            ))}
          </section>

          <section className="mt-8 rounded-2xl border border-[#cde4ff]/45 bg-[#eff7ff]/18 p-6">
            <p className="text-sm uppercase tracking-[0.15em] text-blue-50/80">Primary Contact</p>
            <p className="mt-2 text-lg font-semibold">Soham Jani</p>
            <a href="mailto:sohamjani8@gmail.com" className="mt-1 inline-block text-[#e8f3ff] hover:text-white">
              sohamjani8@gmail.com
            </a>
            <div className="mt-4 space-y-2">
              {responseInfo.map((item) => (
                <p key={item} className="text-sm text-blue-50/82">
                  {item}
                </p>
              ))}
            </div>
          </section>

          <section className="cluely-panel-strong mt-8 rounded-2xl p-6">
            <h3 className="cluely-display text-2xl font-medium text-white">Let’s make financial learning feel real for students.</h3>
            <p className="mt-2 text-sm text-blue-50/84">
              If your team is focused on student confidence, practical literacy, and long-term outcomes, we’d love to collaborate.
            </p>
          </section>

          <div className="mt-9 flex flex-wrap gap-3.5">
            <Link href="/dashboard" className="cluely-cta rounded-xl px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white">
              Experience StockSense
            </Link>
            <Link href="/about" className="cluely-ghost rounded-xl px-5 py-3 text-sm font-semibold text-blue-50">
              Read Our Why
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
