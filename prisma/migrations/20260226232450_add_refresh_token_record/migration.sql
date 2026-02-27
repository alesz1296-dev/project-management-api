-- CreateTable
CREATE TABLE "RefreshTokenRecord" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshTokenRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokenRecord_token_key" ON "RefreshTokenRecord"("token");

-- CreateIndex
CREATE INDEX "RefreshTokenRecord_userId_idx" ON "RefreshTokenRecord"("userId");

-- CreateIndex
CREATE INDEX "RefreshTokenRecord_token_idx" ON "RefreshTokenRecord"("token");

-- AddForeignKey
ALTER TABLE "RefreshTokenRecord" ADD CONSTRAINT "RefreshTokenRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
