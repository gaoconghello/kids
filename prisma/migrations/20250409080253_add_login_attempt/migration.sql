-- CreateTable
CREATE TABLE "login_attempt" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "login_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_attempt_username_idx" ON "login_attempt"("username");
