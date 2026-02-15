import 'dotenv/config';
import fs from 'node:fs';
import readline from 'node:readline';
import { prisma } from '../lib/prisma';

type JsonlPasuk = {
  book: string;
  book_order: number;
  chapter: number;
  verse: number;
  hebrew_text: string;
};

async function main() {
  const inputPath = process.argv[2] ?? 'data/tanach.sample.jsonl';

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const stream = fs.createReadStream(inputPath, { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let processed = 0;

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const row = JSON.parse(trimmed) as JsonlPasuk;
    if (!row.book || !row.book_order || !row.chapter || !row.verse || !row.hebrew_text) {
      throw new Error(`Invalid row at line ${processed + 1}`);
    }

    await prisma.pasuk.upsert({
      where: {
        book_chapter_verse: {
          book: row.book,
          chapter: row.chapter,
          verse: row.verse,
        },
      },
      update: {
        book_order: row.book_order,
        hebrew_text: row.hebrew_text,
      },
      create: {
        book: row.book,
        book_order: row.book_order,
        chapter: row.chapter,
        verse: row.verse,
        hebrew_text: row.hebrew_text,
      },
    });

    processed += 1;
    if (processed % 1000 === 0) {
      console.log(`Imported ${processed} pesukim...`);
    }
  }

  console.log(`Import complete. Total rows processed: ${processed}`);
}

main()
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
