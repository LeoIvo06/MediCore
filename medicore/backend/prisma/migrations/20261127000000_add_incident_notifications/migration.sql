CREATE TABLE "incident_notifications" (
    "recipientId" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "readAt" TIMESTAMP(3),
    CONSTRAINT "incident_notifications_pkey" PRIMARY KEY ("recipientId", "incidentId")
);

CREATE INDEX "incident_notifications_recipientId_readAt_createdAt_idx"
ON "incident_notifications"("recipientId", "readAt", "createdAt");

ALTER TABLE "incident_notifications" ADD CONSTRAINT "incident_notifications_recipientId_fkey"
FOREIGN KEY ("recipientId") REFERENCES "demo_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
