ALTER TABLE "it_alerts"
ADD COLUMN "diagnosisSummary" TEXT,
ADD COLUMN "diagnosisResponded" BOOLEAN,
ADD COLUMN "diagnosedBy" TEXT,
ADD COLUMN "diagnosedAt" TIMESTAMP(3);
