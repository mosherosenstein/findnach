const embeddingModel = process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small';

const embeddingDimensions =
  embeddingModel === 'text-embedding-3-large'
    ? 3072
    : embeddingModel === 'text-embedding-3-small'
      ? 1536
      : Number(process.env.EMBEDDING_DIMENSIONS ?? 1536);

export const env = {
  databaseUrl: process.env.DATABASE_URL,
  openaiApiKey: process.env.OPENAI_API_KEY,
  embeddingModel,
  embeddingDimensions,
};
