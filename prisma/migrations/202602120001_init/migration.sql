CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "Pasuk" (
    "id" SERIAL PRIMARY KEY,
    "book" TEXT NOT NULL,
    "book_order" INTEGER NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    "hebrew_text" TEXT NOT NULL,
    "hebrew_text_plain" TEXT,
    "embedding" vector(1536),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "Pasuk_book_chapter_verse_key" ON "Pasuk"("book", "chapter", "verse");
CREATE INDEX "Pasuk_book_order_chapter_verse_idx" ON "Pasuk"("book_order", "chapter", "verse");
CREATE INDEX "pasuk_embedding_idx" ON "Pasuk" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
