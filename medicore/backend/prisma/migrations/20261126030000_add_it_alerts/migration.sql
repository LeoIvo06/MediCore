-- CreateTable
CREATE TABLE "it_alerts" (
    "number" SERIAL NOT NULL,
    "stationId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "ip" TEXT,
    "reporterId" TEXT NOT NULL,
    "reporterName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),

    CONSTRAINT "it_alerts_pkey" PRIMARY KEY ("number")
);

-- CreateIndex
CREATE INDEX "it_alerts_reporterId_createdAt_idx" ON "it_alerts"("reporterId", "createdAt");
