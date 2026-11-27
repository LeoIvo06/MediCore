-- CreateEnum
CREATE TYPE "GeneralServicesPriority" AS ENUM ('Critical', 'High', 'Medium', 'Low');

-- CreateTable
CREATE TABLE "general_services_incidents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "incidentType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "symptom" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "priority" "GeneralServicesPriority" NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "general_services_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "general_services_incidents_closedAt_idx" ON "general_services_incidents"("closedAt");
