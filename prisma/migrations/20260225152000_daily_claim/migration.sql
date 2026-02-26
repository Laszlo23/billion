-- AlterEnum
ALTER TYPE "ReferenceType" ADD VALUE 'daily_claim';

-- CreateTable
CREATE TABLE "AdPlaceholderView" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "placementKey" TEXT NOT NULL,
    "sessionId" TEXT,
    "metadata" JSONB,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdPlaceholderView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyClaim" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adPlaceholderViewId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cooldownEndsAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdPlaceholderView_userId_viewedAt_idx" ON "AdPlaceholderView"("userId", "viewedAt");

-- CreateIndex
CREATE INDEX "AdPlaceholderView_placementKey_viewedAt_idx" ON "AdPlaceholderView"("placementKey", "viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DailyClaim_adPlaceholderViewId_key" ON "DailyClaim"("adPlaceholderViewId");

-- CreateIndex
CREATE INDEX "DailyClaim_userId_claimedAt_idx" ON "DailyClaim"("userId", "claimedAt");

-- CreateIndex
CREATE INDEX "DailyClaim_userId_cooldownEndsAt_idx" ON "DailyClaim"("userId", "cooldownEndsAt");

-- AddForeignKey
ALTER TABLE "AdPlaceholderView" ADD CONSTRAINT "AdPlaceholderView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyClaim" ADD CONSTRAINT "DailyClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyClaim" ADD CONSTRAINT "DailyClaim_adPlaceholderViewId_fkey" FOREIGN KEY ("adPlaceholderViewId") REFERENCES "AdPlaceholderView"("id") ON DELETE CASCADE ON UPDATE CASCADE;
