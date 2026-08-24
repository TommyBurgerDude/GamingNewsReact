import { useEffect, useState, useMemo } from "react";
import { useNewsStore } from './store/news';
import './App.css';

function App() {
  const { articles, loading, error, getNews } = useNewsStore();
  const [selectedSource, setSelectedSource] = useState<string>("All");

  useEffect(() => {
    getNews();
  }, [getNews]);

  const sources = useMemo(() => {
    const origins = Array.from(new Set(articles.map((item) => item.origin)));
   return ["All", ...origins.sort((a, b) => a.localeCompare(b))];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    if (selectedSource === "All") return articles;
    return articles.filter((item) => item.origin === selectedSource);
  }, [articles, selectedSource]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-stone-900 text-white">
        <header className="border-b border-stone-800 bg-stone-900/95 px-4 py-3 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl animate-pulse">
            <div className="h-7 w-48 rounded bg-stone-800 mb-2" />
            <div className="h-6 w-full max-w-xl rounded bg-stone-800" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col rounded-xl border border-stone-800 bg-stone-800/40 p-5 animate-pulse"
                >
                  <div className="mb-4 aspect-video w-full rounded-lg bg-stone-800" />
                  <div className="h-5 w-3/4 rounded bg-stone-800 mb-2" />
                  <div className="h-4 w-full rounded bg-stone-800 mb-1" />
                  <div className="h-4 w-2/3 rounded bg-stone-800 mb-6" />
                  <div className="mt-auto flex justify-between pt-2">
                    <div className="h-5 w-16 rounded bg-stone-800" />
                    <div className="h-5 w-20 rounded bg-stone-800" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-900 p-4 text-center">
        <div className="max-w-md rounded-xl border border-stone-800 bg-stone-800/50 p-6">
          <h2 className="text-lg font-semibold text-stone-200 mb-2">Unable to load feed</h2>
          <p className="text-sm text-red-400 mb-4">{error}</p>
          <button
            onClick={() => getNews()}
            className="rounded-lg bg-stone-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-stone-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-stone-900 text-white">
      {/* Fixed Header */}
      <header className="border-b border-stone-800 bg-stone-900/95 px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-xl font-bold tracking-tight text-stone-100 mb-2">
            GG Feed
          </h1>

          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            {sources.map((source) => (
              <button
                key={source}
                onClick={() => setSelectedSource(source)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  selectedSource === source
                    ? "bg-red-600 text-white shadow-md shadow-red-900/30"
                    : "bg-stone-800/80 text-stone-400 hover:bg-stone-700/80 hover:text-stone-200"
                }`}
              >
                {source}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {filteredArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-stone-400 font-medium">No articles found for "{selectedSource}".</p>
              <button
                onClick={() => setSelectedSource("All")}
                className="mt-3 text-xs font-semibold text-red-400 hover:underline"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((item) => (
                <a
                  key={item.link}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col overflow-hidden rounded-xl border border-stone-800 bg-stone-800/60 p-5 text-white transition-all duration-300 hover:-translate-y-1 hover:border-stone-700 hover:bg-stone-800 hover:shadow-xl hover:shadow-black/40"
                >
                  <div className="mb-4 overflow-hidden rounded-lg bg-stone-900/80">
                    {item.img ? (
                      <img
                        src={item.img}
                        alt=""
                        className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex aspect-video w-full items-center justify-center text-xs font-semibold tracking-wider text-stone-600 uppercase">
                        {item.origin}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h2 className="mb-2 text-base font-semibold leading-snug text-stone-100 transition-colors group-hover:text-red-400">
                        {item.title}
                      </h2>
                      <p className="line-clamp-3 text-sm text-stone-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-stone-700/40 pt-3 text-xs">
                      <span className="rounded bg-stone-700/50 px-2 py-0.5 font-medium text-stone-300">
                        {item.origin}
                      </span>
                      <span className="text-stone-500 font-medium">
                        {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;