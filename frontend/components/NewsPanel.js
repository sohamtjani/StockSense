function badge(sentiment) {
  if (sentiment === "positive") return "bg-emerald-400/20 text-emerald-200 border border-emerald-300/30";
  if (sentiment === "negative") return "bg-rose-400/20 text-rose-200 border border-rose-300/30";
  return "bg-slate-300/20 text-slate-200 border border-slate-300/30";
}

export default function NewsPanel({ news }) {
  return (
    <div className="glass rounded-3xl p-5">
      <h3 className="text-lg font-bold">Market Coverage</h3>
      <div className="mt-3 space-y-3">
        {news?.map((article) => (
          <a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-xl border border-blue-200/15 bg-white/5 p-3 transition hover:bg-white/10"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-blue-50">{article.headline}</p>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${badge(article.sentiment)}`}>
                {article.sentiment}
              </span>
            </div>
            <p className="mt-1 text-xs text-blue-100/70">
              {article.source} • {new Date(article.publishedAt).toLocaleDateString()}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
