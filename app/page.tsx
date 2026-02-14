import { SearchForm } from '@/components/search-form';

export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Tanach Topic Search</h1>
      <p className="text-slate-600">
        Semantic pasuk search across Torah, Nevi&apos;im, and Ketuvim. Hebrew text only.
      </p>
      <SearchForm />
    </div>
  );
}
