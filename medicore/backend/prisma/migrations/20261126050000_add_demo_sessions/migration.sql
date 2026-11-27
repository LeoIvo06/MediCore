-- CreateTable
CREATE TABLE "demo_sessions" (
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demo_sessions_pkey" PRIMARY KEY ("tokenHash")
);

-- CreateIndex
CREATE INDEX "demo_sessions_expiresAt_idx" ON "demo_sessions"("expiresAt");

-- AddForeignKey
ALTER TABLE "demo_sessions" ADD CONSTRAINT "demo_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "demo_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
