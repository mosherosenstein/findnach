import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { env } from '../lib/env';

async function main() {
  const dims = env.embeddingDimensions;

  await prisma.$executeRawUnsafe('DROP INDEX IF EXISTS pasuk_embedding_idx;');
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Pasuk" ALTER COLUMN embedding TYPE vector(${dims}) USING NULL;`,
  );
  await prisma.$executeRawUnsafe(
    'CREATE INDEX pasuk_embedding_idx ON "Pasuk" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);',
  );

  console.log(`Updated embedding column to vector(${dims}). Existing embeddings were cleared.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
