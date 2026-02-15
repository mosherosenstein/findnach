'use client';

import { useState } from 'react';
import { TANACH_BOOKS } from '@/lib/books';

type SearchResult = {
  book: string;
  chapter: number;
  verse: number;
  hebrew_text: string;
  similarity?: number;
};

export function SearchForm() {
  const [q, setQ] = useState('');
  const [book, setBook] = useState('');
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [showScores, setShowScores] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const params = new URLSearchParams({ q, limit: String(limit) });
      if (book) params.set('book', book);

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Search failed');
      }

      setResults(data.results ?? []);
      setMessage(data.message ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setResults([]);
      setMessage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="space-y-4 rounded-lg border bg-white p-4 shadow-sm">
        <div>
          <label htmlFor="q" className="mb-1 block text-sm font-medium text-slate-700">
            Search query (Hebrew or English)
          </label>
          <input
            id="q"
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. light, ברית, mercy"
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="book" className="mb-1 block text-sm font-medium text-slate-700">
              Optional book filter
            </label>
            <select
              id="book"
              value={book}
              onChange={(e) => setBook(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="">All books</option>
              {TANACH_BOOKS.map((bookOption) => (
                <option key={bookOption.name} value={bookOption.name}>
                  {bookOption.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="limit" className="mb-1 block text-sm font-medium text-slate-700">
              Limit
            </label>
            <input
              id="limit"
              type="number"
              min={1}
              max={50}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={showScores}
            onChange={(e) => setShowScores(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Show scores
        </label>
      </form>

      {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Results ({results.length})</h2>
        {message && <p className="text-sm text-slate-500">{message}</p>}
        {results.length === 0 && !error && !message && <p className="text-slate-600">No results yet. Run a search above.</p>}
        {results.map((result) => (
          <article key={`${result.book}-${result.chapter}-${result.verse}`} className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="mb-1 text-sm font-semibold text-slate-700">
              {result.book} {result.chapter}:{result.verse}
            </h3>
            {showScores && typeof result.similarity === 'number' && (
              <p className="mb-2 text-xs text-slate-500">Similarity: {result.similarity.toFixed(3)}</p>
            )}
        {results.length === 0 && !error && <p className="text-slate-600">No results yet. Run a search above.</p>}
        {results.map((result) => (
          <article key={`${result.book}-${result.chapter}-${result.verse}`} className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">
              {result.book} {result.chapter}:{result.verse}
            </h3>
            <p dir="rtl" lang="he" className="text-right text-xl leading-8 text-slate-900">
              {result.hebrew_text}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
