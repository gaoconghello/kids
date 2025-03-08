/*
  Warnings:

  - You are about to drop the `prize` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `prize_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "prize";

-- DropTable
DROP TABLE "prize_history";

-- CreateTable
CREATE TABLE "reward" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100),
    "integral" INTEGER,
    "family_id" INTEGER,
    "pic" VARCHAR(36),
    "pic_ext" VARCHAR(20),
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_user_id" INTEGER,
    "updated_user_id" INTEGER,

    CONSTRAINT "reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_history" (
    "id" SERIAL NOT NULL,
    "reward_id" INTEGER,
    "review" VARCHAR(1),
    "review_time" TIMESTAMP(6),
    "child_id" INTEGER,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_user_id" INTEGER,
    "updated_user_id" INTEGER,

    CONSTRAINT "reward_history_pkey" PRIMARY KEY ("id")
);
