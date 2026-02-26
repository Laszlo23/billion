-- CreateEnum
CREATE TYPE "SocialConnectionStatus" AS ENUM (
  'disconnected',
  'connected_unverified',
  'connected_verified'
);

-- AlterTable
ALTER TABLE "TaskerProfile"
ADD COLUMN "instagramHandle" TEXT,
ADD COLUMN "instagramStatus" "SocialConnectionStatus" NOT NULL DEFAULT 'disconnected',
ADD COLUMN "tiktokHandle" TEXT,
ADD COLUMN "tiktokStatus" "SocialConnectionStatus" NOT NULL DEFAULT 'disconnected',
ADD COLUMN "linkedinHandle" TEXT,
ADD COLUMN "linkedinStatus" "SocialConnectionStatus" NOT NULL DEFAULT 'disconnected';
