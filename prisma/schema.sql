-- ====================================================================
-- HEMATIN - SAFE IDEMPOTENT DATABASE MIGRATION SCRIPT FOR SUPABASE
-- Bisa dijalankan berkali-kali tanpa error "already exists"
-- ====================================================================

-- 1. Create Enums (Aman jika sudah ada)
DO $$ BEGIN
    CREATE TYPE "AccountType" AS ENUM ('CASH', 'BANK', 'EWALLET', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CategoryType" AS ENUM ('INCOME', 'EXPENSE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Table: Account
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "initialBalance" BIGINT NOT NULL DEFAULT 0,
    "icon" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- Unique index on Account name
CREATE UNIQUE INDEX IF NOT EXISTS "Account_name_key" ON "Account"("name");

-- 3. Create Table: Category
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- Unique index on (name, type) for Category
CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_type_key" ON "Category"("name", "type");

-- 4. Create Table: Transaction
CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" BIGINT NOT NULL,
    "note" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- Indices on Transaction
CREATE INDEX IF NOT EXISTS "Transaction_date_idx" ON "Transaction"("date");
CREATE INDEX IF NOT EXISTS "Transaction_accountId_date_idx" ON "Transaction"("accountId", "date");
CREATE INDEX IF NOT EXISTS "Transaction_categoryId_date_idx" ON "Transaction"("categoryId", "date");
CREATE INDEX IF NOT EXISTS "Transaction_type_date_idx" ON "Transaction"("type", "date");

-- Foreign key constraints on Transaction
DO $$ BEGIN
    ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" 
        FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" 
        FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Create Table: Budget
CREATE TABLE IF NOT EXISTS "Budget" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- Unique index & search index for Budget
CREATE UNIQUE INDEX IF NOT EXISTS "Budget_categoryId_month_year_key" ON "Budget"("categoryId", "month", "year");
CREATE INDEX IF NOT EXISTS "Budget_year_month_idx" ON "Budget"("year", "month");

-- Foreign key constraint on Budget
DO $$ BEGIN
    ALTER TABLE "Budget" ADD CONSTRAINT "Budget_categoryId_fkey" 
        FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. Create Table: Setting
CREATE TABLE IF NOT EXISTS "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- 7. Enable Row Level Security (RLS) on all tables (PRD 9.14 FR-SEC-5)
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Budget" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Setting" ENABLE ROW LEVEL SECURITY;

-- 8. Seed Default Categories (Tanpa Emote)
INSERT INTO "Category" ("id", "name", "type", "icon", "color", "isDefault", "isArchived", "updatedAt")
VALUES
    ('cat_exp_food', 'Food', 'EXPENSE', NULL, '#F97316', true, false, CURRENT_TIMESTAMP),
    ('cat_exp_transport', 'Transportation', 'EXPENSE', NULL, '#3B82F6', true, false, CURRENT_TIMESTAMP),
    ('cat_exp_shopping', 'Shopping', 'EXPENSE', NULL, '#EC4899', true, false, CURRENT_TIMESTAMP),
    ('cat_exp_ent', 'Entertainment', 'EXPENSE', NULL, '#8B5CF6', true, false, CURRENT_TIMESTAMP),
    ('cat_exp_bills', 'Bills', 'EXPENSE', NULL, '#EF4444', true, false, CURRENT_TIMESTAMP),
    ('cat_exp_edu', 'Education', 'EXPENSE', NULL, '#10B981', true, false, CURRENT_TIMESTAMP),
    ('cat_exp_health', 'Health', 'EXPENSE', NULL, '#06B6D4', true, false, CURRENT_TIMESTAMP),
    ('cat_exp_other', 'Other', 'EXPENSE', NULL, '#6B7280', true, false, CURRENT_TIMESTAMP),
    ('cat_inc_salary', 'Salary', 'INCOME', NULL, '#10B981', true, false, CURRENT_TIMESTAMP),
    ('cat_inc_freelance', 'Freelance', 'INCOME', NULL, '#3B82F6', true, false, CURRENT_TIMESTAMP),
    ('cat_inc_gift', 'Gift', 'INCOME', NULL, '#F59E0B', true, false, CURRENT_TIMESTAMP),
    ('cat_inc_other', 'Other', 'INCOME', NULL, '#6B7280', true, false, CURRENT_TIMESTAMP)
ON CONFLICT ("name", "type") DO UPDATE SET "icon" = NULL;

-- Hapus emote jika sebelumnya sudah terisi
UPDATE "Category" SET "icon" = NULL WHERE "icon" IS NOT NULL;

-- 9. Seed Default Settings
INSERT INTO "Setting" ("key", "value", "updatedAt")
VALUES
    ('theme', 'system', CURRENT_TIMESTAMP),
    ('monthStartDay', '1', CURRENT_TIMESTAMP),
    ('onboardingDone', 'false', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
