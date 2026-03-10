import Link from "next/link";
import MarketingNav from "@/components/MarketingNav";
import { essentialsMeta, essentialsModules } from "@/lib/essentialsContent";

function stripMdLine(line) {
  return line.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1").trim();
}

function parseTableRow(line) {
  return line
    .split("|")
    .map((cell) => cell.trim())
    .filter((cell, idx, arr) => !(cell === "" && (idx === 0 || idx === arr.length - 1)));
}

function isAlignmentRow(cells) {
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function renderBlock(block, keyBase, isDashboard) {
  const lines = block.split("\n").map((line) => line.trimEnd());
  const cleaned = lines.map(stripMdLine);

  if (cleaned.length === 1 && cleaned[0] === "") {
    return <div key={keyBase} className="h-2" />;
  }

  if (cleaned.length === 1 && cleaned[0] === "---") {
    return <hr key={keyBase} className={`my-4 ${isDashboard ? "border-blue-200/20" : "border-blue-100/30"}`} />;
  }

  if (cleaned[0]?.startsWith("### ")) {
    return (
      <h4 key={keyBase} className={`mt-4 text-base font-semibold ${isDashboard ? "text-cyan-100" : "cluely-readable text-white"}`}>
        {cleaned[0].replace(/^###\s*/, "")}
      </h4>
    );
  }

  if (cleaned.every((line) => line.startsWith("|"))) {
    const rows = cleaned.map(parseTableRow).filter((row) => row.length > 0);
    const header = rows[0] || [];
    let body = rows.slice(1);

    if (body.length > 0 && isAlignmentRow(body[0])) {
      body = body.slice(1);
    }

    return (
      <div
        key={keyBase}
        className={`overflow-x-auto rounded-xl border ${
          isDashboard ? "border-blue-200/20 bg-[#091733]" : "border-[#d6e9ff]/65 bg-[#0f2f5f]/82"
        }`}
      >
        <table className="min-w-full border-collapse text-left text-xs md:text-sm">
          <thead>
            <tr className={isDashboard ? "bg-[#0d2149]" : "bg-[#114076]"}>
              {header.map((cell, idx) => (
                <th
                  key={`${keyBase}-th-${idx}`}
                  className={`border-b px-3 py-2 font-semibold ${
                    isDashboard ? "border-blue-200/20 text-cyan-100" : "border-blue-100/35 text-white"
                  }`}
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, rowIdx) => (
              <tr
                key={`${keyBase}-tr-${rowIdx}`}
                className={isDashboard ? "border-t border-blue-200/15" : "border-t border-blue-100/25"}
              >
                {row.map((cell, cellIdx) => (
                  <td
                    key={`${keyBase}-td-${rowIdx}-${cellIdx}`}
                    className={`align-top px-3 py-2 leading-relaxed ${
                      isDashboard ? "text-blue-100/90" : "cluely-readable text-[#f3f8ff]"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (cleaned.every((line) => /^-\s+/.test(line))) {
    return (
      <ul key={keyBase} className={`list-disc space-y-1 pl-5 text-sm ${isDashboard ? "text-blue-100/90" : "cluely-readable text-[#f3f8ff]"}`}>
        {cleaned.map((line, idx) => (
          <li key={`${keyBase}-li-${idx}`}>{line.replace(/^-\s+/, "")}</li>
        ))}
      </ul>
    );
  }

  if (cleaned.every((line) => /^\d+\.\s+/.test(line))) {
    return (
      <ol key={keyBase} className={`list-decimal space-y-1 pl-5 text-sm ${isDashboard ? "text-blue-100/90" : "cluely-readable text-[#f3f8ff]"}`}>
        {cleaned.map((line, idx) => (
          <li key={`${keyBase}-ol-${idx}`}>{line.replace(/^\d+\.\s+/, "")}</li>
        ))}
      </ol>
    );
  }

  if (cleaned.every((line) => line.startsWith("> "))) {
    return (
      <blockquote
        key={keyBase}
        className={`rounded-xl border-l-4 px-3 py-2 text-sm italic ${
          isDashboard
            ? "border-cyan-300/70 bg-cyan-500/10 text-cyan-100"
            : "cluely-readable border-blue-100/90 bg-[#0d2a54]/82 text-[#f5faff]"
        }`}
      >
        {cleaned.map((line) => line.replace(/^>\s*/, "")).join(" ")}
      </blockquote>
    );
  }

  return (
    <p key={keyBase} className={`whitespace-pre-line text-sm leading-relaxed ${isDashboard ? "text-blue-100/90" : "cluely-readable text-[#f3f8ff]"}`}>
      {cleaned.join("\n")}
    </p>
  );
}

function renderModuleContent(content, isDashboard, moduleId) {
  const blocks = content.split(/\n\n+/);
  return blocks.map((block, idx) => renderBlock(block, `${moduleId}-${idx}`, isDashboard));
}

export default function EssentialsPage({ searchParams }) {
  const source = searchParams?.source === "dashboard" ? "dashboard" : "landing";
  const isDashboard = source === "dashboard";

  return (
    <main
      className={
        isDashboard
          ? "min-h-screen bg-[#030918] text-[#edf4ff]"
          : "cluely-shell min-h-screen bg-gradient-to-b from-[#2768b8] via-[#4a8fd8] to-[#79acdd] text-white"
      }
    >
      <section className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
        {isDashboard ? (
          <header className="mb-8 rounded-2xl border border-blue-200/20 bg-[#0a1735] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">StockSense Learning</p>
                <h1 className="text-xl font-semibold">Essentials</h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/dashboard" className="rounded-full border border-blue-200/35 bg-white/5 px-4 py-2 text-xs font-semibold text-blue-100 hover:border-cyan-200/70">
                  Back to Dashboard
                </Link>
                <Link href="/" className="rounded-full border border-blue-200/35 bg-white/5 px-4 py-2 text-xs font-semibold text-blue-100 hover:border-cyan-200/70">
                  Landing Page
                </Link>
              </div>
            </div>
          </header>
        ) : (
          <>
            <MarketingNav compact />
            <div className="mt-8 rounded-2xl border border-[#d8ebff]/70 bg-[rgba(12,42,84,0.88)] p-5 shadow-[0_14px_30px_rgba(8,30,68,0.34)]">
              <p className="cluely-readable text-xs uppercase tracking-[0.2em] text-[#e4f1ff]">StockSense Learning</p>
              <h1 className="cluely-display mt-1 text-4xl font-medium text-white">Essentials</h1>
              <p className="cluely-readable mt-2 text-sm text-[#eff7ff]">Structured investing fundamentals for students, split into module dropdowns.</p>
            </div>
          </>
        )}

        <section
          className={`mt-6 rounded-3xl border p-6 md:p-8 ${
            isDashboard
              ? "border-blue-200/20 bg-[#091633]"
              : "border-[#d8ecff]/70 bg-[rgba(11,36,74,0.88)] shadow-[0_12px_26px_rgba(8,30,68,0.34)]"
          }`}
        >
          <h2 className={`text-2xl font-semibold ${isDashboard ? "text-white" : "cluely-display text-3xl font-medium text-white"}`}>{essentialsMeta.title}</h2>
          <p className={`mt-2 text-sm ${isDashboard ? "text-blue-100/80" : "cluely-readable text-[#edf6ff]"}`}>{essentialsMeta.subtitle}</p>
          <p className={`mt-4 text-sm leading-relaxed ${isDashboard ? "text-blue-100/90" : "cluely-readable text-[#f2f8ff]"}`}>{essentialsMeta.packetPurpose}</p>
          <p className={`mt-3 text-sm leading-relaxed ${isDashboard ? "text-blue-100/90" : "cluely-readable text-[#f2f8ff]"}`}>{essentialsMeta.disclaimer}</p>
          <p className={`mt-3 text-sm leading-relaxed ${isDashboard ? "text-blue-100/90" : "cluely-readable text-[#f2f8ff]"}`}>{essentialsMeta.context}</p>
        </section>

        <section className="mt-6 space-y-3">
          {essentialsModules.map((module, idx) => (
            <details
              key={module.id}
              open={idx === 0}
              className={`group overflow-hidden rounded-2xl border ${
                isDashboard
                  ? "border-blue-200/20 bg-[#0b1b3f]"
                  : "border-[#daedff]/70 bg-[rgba(10,38,81,0.90)] shadow-[0_10px_22px_rgba(7,28,64,0.32)]"
              }`}
            >
              <summary
                className={`cursor-pointer list-none px-4 py-4 text-sm font-semibold md:px-5 ${
                  isDashboard ? "text-cyan-100" : "text-[#f8fbff] [text-shadow:0_1px_2px_rgba(6,20,45,0.72)]"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${isDashboard ? "bg-cyan-300" : "bg-blue-100"}`} />
                  {module.title}
                </span>
              </summary>
              <div className={`border-t px-4 pb-5 pt-4 md:px-5 ${isDashboard ? "border-blue-200/20" : "border-[#daedff]/45"}`}>
                <div className="space-y-3">{renderModuleContent(module.content, isDashboard, module.id)}</div>
              </div>
            </details>
          ))}
        </section>
      </section>
    </main>
  );
}
