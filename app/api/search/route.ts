import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/lib/env';
import { getOpenAIClient } from '@/lib/openai';
import { prisma } from '@/lib/prisma';

const searchSchema = z.object({
  q: z.string().min(1, 'Query is required'),
  book: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

type SearchRow = {
  book: string;
  chapter: number;
  verse: number;
  hebrew_text: string;
  similarity: number;
};

export async function GET(request: NextRequest) {
  try {
    const parsed = searchSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 });
    }

    const { q, book, limit } = parsed.data;

    const openai = getOpenAIClient();
    const embeddingResponse = await openai.embeddings.create({
      model: env.embeddingModel,
      input: q,
    });

    const queryEmbedding = embeddingResponse.data[0]?.embedding;
    if (!queryEmbedding || queryEmbedding.length !== env.embeddingDimensions) {
      return NextResponse.json({ error: 'Embedding dimensions mismatch.' }, { status: 500 });
    }

    const vectorLiteral = `[${queryEmbedding.join(',')}]`;

    const minSimilarity = Number.isFinite(env.minSimilarity) ? Math.min(Math.max(env.minSimilarity, 0), 1) : 0.78;

    const rows = await prisma.$queryRaw<SearchRow[]>`
      SELECT
        book,
        chapter,
        verse,
        hebrew_text,
        (1 - (embedding <=> ${vectorLiteral}::vector))::float8 AS similarity
      FROM "Pasuk"
      WHERE embedding IS NOT NULL
        AND (${book ?? null}::text IS NULL OR book = ${book ?? null})
        AND (1 - (embedding <=> ${vectorLiteral}::vector)) >= ${minSimilarity}
    const rows = await prisma.$queryRaw<SearchRow[]>`
      SELECT book, chapter, verse, hebrew_text
      FROM "Pasuk"
      WHERE embedding IS NOT NULL
        AND (${book ?? null}::text IS NULL OR book = ${book ?? null})
      ORDER BY embedding <=> ${vectorLiteral}::vector
      LIMIT ${limit};
    `;

    if (rows.length === 0) {
      return NextResponse.json({ results: [], message: 'No strong matches found.' });
    }

    return NextResponse.json({ results: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error.';
    const status = message.includes('OPENAI_API_KEY') ? 500 : 502;
    return NextResponse.json({ error: `Search failed: ${message}` }, { status });
  }
}
