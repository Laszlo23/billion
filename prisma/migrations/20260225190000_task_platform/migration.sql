-- CreateEnum
CREATE TYPE "TaskPlatform" AS ENUM (
  'instagram',
  'tiktok',
  'linkedin',
  'youtube',
  'google_review',
  'other'
);

-- AlterTable
ALTER TABLE "Task"
ADD COLUMN "platform" "TaskPlatform" NOT NULL DEFAULT 'other';
