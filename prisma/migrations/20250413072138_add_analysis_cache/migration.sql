-- CreateTable
CREATE TABLE "analysis_cache" (
    "id" SERIAL NOT NULL,
    "child_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "last_days" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "analysis_cache_pkey" PRIMARY KEY ("id")
);
