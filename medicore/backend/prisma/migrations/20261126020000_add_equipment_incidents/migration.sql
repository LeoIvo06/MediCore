-- CreateTable
CREATE TABLE "equipment_incidents" (
    "number" SERIAL NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "equipmentName" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "locationLabel" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "symptomId" TEXT NOT NULL,
    "symptomLabel" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reporterName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_incidents_pkey" PRIMARY KEY ("number")
);

-- CreateIndex
CREATE INDEX "equipment_incidents_createdAt_idx" ON "equipment_incidents"("createdAt");
