-- CreateTable
CREATE TABLE "CareerCompassReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "structuredData" JSONB NOT NULL,
    "markdownReport" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerCompassReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CareerCompassReport_userId_key" ON "CareerCompassReport"("userId");

-- CreateIndex
CREATE INDEX "CareerCompassReport_userId_idx" ON "CareerCompassReport"("userId");

-- AddForeignKey
ALTER TABLE "CareerCompassReport" ADD CONSTRAINT "CareerCompassReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
