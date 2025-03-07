-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(50) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "age" INTEGER,
    "parent_id" INTEGER,
    "grade" INTEGER,
    "role" VARCHAR(20) NOT NULL,
    "family_id" INTEGER,
    "integral" INTEGER,
    "mobile" VARCHAR(20),
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_user_id" INTEGER,
    "updated_user_id" INTEGER,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50),
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_user_id" INTEGER,
    "updated_user_id" INTEGER,

    CONSTRAINT "family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homework" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "subject_id" INTEGER,
    "estimated_duration" INTEGER,
    "deadline" TIMESTAMP(6),
    "integral" INTEGER,
    "incorrect" INTEGER,
    "homework_date" DATE,
    "create_review" VARCHAR(1),
    "complete_review" VARCHAR(1),
    "create_review_time" TIMESTAMP(6),
    "complete_review_time" TIMESTAMP(6),
    "create_review_user_id" INTEGER,
    "complete_review_user_id" INTEGER,
    "complete_time" TIMESTAMP(6),
    "child_id" INTEGER,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_user_id" INTEGER,
    "updated_user_id" INTEGER,

    CONSTRAINT "homework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integral_history" (
    "id" SERIAL NOT NULL,
    "integral_id" INTEGER,
    "integral_type" VARCHAR(2),
    "child_id" INTEGER,
    "family_id" INTEGER,

    CONSTRAINT "integral_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prize" (
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

    CONSTRAINT "prize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prize_history" (
    "id" SERIAL NOT NULL,
    "prize_id" INTEGER,
    "review" VARCHAR(1),
    "review_time" TIMESTAMP(6),
    "child_id" INTEGER,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_user_id" INTEGER,
    "updated_user_id" INTEGER,

    CONSTRAINT "prize_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100),
    "integral" INTEGER,
    "child_id" INTEGER,
    "create_review" VARCHAR(1),
    "complete_review" VARCHAR(1),
    "create_review_time" TIMESTAMP(6),
    "complete_review_time" TIMESTAMP(6),
    "create_review_user_id" INTEGER,
    "complete_review_user_id" INTEGER,
    "complete_time" TIMESTAMP(6),
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_user_id" INTEGER,
    "updated_user_id" INTEGER,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);
