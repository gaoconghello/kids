-- CreateTable
CREATE TABLE "subject" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_user_id" INTEGER,
    "updated_user_id" INTEGER,

    CONSTRAINT "subject_pkey" PRIMARY KEY ("id")
);
