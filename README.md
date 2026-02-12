# Tanach Topic Search

MVP web app for semantic search over Hebrew-only Tanach pesukim (Torah + Nevi'im + Ketuvim).

## Stack

- Next.js 14 (App Router) + TypeScript
- PostgreSQL + pgvector
- Prisma ORM
- Tailwind CSS
- OpenAI Embeddings API (server-side only)

## What it does

- `GET /api/search?q=...&book=...&limit=...`
- Query can be Hebrew or English
- Returns only matching pesukim: `book`, `chapter`, `verse`, `hebrew_text`
- Optional filter by book
- No translations, no commentary, no AI explanations

## Data format

Input JSONL schema (one pasuk per line):

```json
{ "book": "Genesis", "book_order": 1, "chapter": 1, "verse": 1, "hebrew_text": "..." }
```

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Start Postgres + pgvector:

```bash
docker compose up -d
```

4. Run Prisma migration + generate client:

```bash
npm run prisma:generate
npx prisma migrate deploy
```

5. Import sample data (~30 pesukim):

```bash
npm run import -- data/tanach.sample.jsonl
```

6. Generate embeddings:

```bash
npm run embed
```

7. Start app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Full Tanach import

Replace `data/tanach.sample.jsonl` with your full file at `data/tanach.jsonl` using the same schema, then:

```bash
npm run import -- data/tanach.jsonl
npm run embed
```

`embed` is resumable: it only embeds rows where `embedding IS NULL`. You can resume from an ID with `START_AFTER_ID`.

## Embedding model and dimensions

Default model: `text-embedding-3-small` (1536 dimensions).

To switch to `text-embedding-3-large`:

1. Set `EMBEDDING_MODEL="text-embedding-3-large"` in `.env`.
2. Update DB vector dimension:

```bash
npm run embedding:dimension
```

This command changes the vector column size and clears existing embeddings; rerun `npm run embed` afterward.

## Scripts

- `scripts/import_tanach.ts` – upsert JSONL pesukim into DB
- `scripts/embed_tanach.ts` – normalize Hebrew text and add embeddings in batches
- `scripts/set_embedding_dimensions.ts` – switch vector dimensions for model changes

## Source note

Hebrew Tanach text source: Westminster Leningrad Codex (WLC) public domain (text only).
