import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { normalizeHebrewText } from '../lib/hebrew';
import { env } from '../lib/env';
import { getOpenAIClient } from '../lib/openai';

type PasukRow = {
  id: number;
  hebrew_text: string;
};

const BATCH_SIZE = Number(process.env.EMBED_BATCH_SIZE ?? 50);
const START_AFTER_ID = Number(process.env.START_AFTER_ID ?? 0);

async function main() {
  const openai = getOpenAIClient();
  let lastId = START_AFTER_ID;
  let totalEmbedded = 0;

  while (true) {
    const rows = await prisma.$queryRaw<PasukRow[]>`
      SELECT id, hebrew_text
      FROM "Pasuk"
      WHERE id > ${lastId}
        AND embedding IS NULL
      ORDER BY id ASC
      LIMIT ${BATCH_SIZE};
    `;

    if (rows.length === 0) {
      break;
    }

    const normalizedTexts = rows.map((row) => normalizeHebrewText(row.hebrew_text));

    for (let i = 0; i < rows.length; i += 20) {
      const chunkRows = rows.slice(i, i + 20);
      const chunkTexts = normalizedTexts.slice(i, i + 20);

      const embeddingResponse = await openai.embeddings.create({
        model: env.embeddingModel,
        input: chunkTexts,
      });

      for (let j = 0; j < chunkRows.length; j += 1) {
        const row = chunkRows[j];
        const plain = chunkTexts[j];
        const embedding = embeddingResponse.data[j]?.embedding;
        if (!embedding) {
          throw new Error(`Missing embedding for id ${row.id}`);
        }

        if (embedding.length !== env.embeddingDimensions) {
          throw new Error(
            `Embedding length mismatch for id ${row.id}. Expected ${env.embeddingDimensions}, got ${embedding.length}.`,
          );
        }

        const vectorLiteral = `[${embedding.join(',')}]`;
        await prisma.$executeRaw`
          UPDATE "Pasuk"
          SET hebrew_text_plain = ${plain},
              embedding = ${vectorLiteral}::vector,
              updated_at = NOW()
          WHERE id = ${row.id};
        `;

        totalEmbedded += 1;
        lastId = row.id;
      }
    }

    console.log(`Embedded ${totalEmbedded} rows so far. Last ID: ${lastId}`);
  }

  console.log(`Embedding complete. Total embedded in this run: ${totalEmbedded}.`);
}

main()
  .catch((error) => {
    console.error('Embedding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
