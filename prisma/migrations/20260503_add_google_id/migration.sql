-- AlterTable: add google_id column to users
ALTER TABLE "users" ADD COLUMN "google_id" TEXT UNIQUE;
