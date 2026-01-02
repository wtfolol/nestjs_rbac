-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isDeleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isVerified" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "numberOfWrongPassword" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "prevhashedtoken" TEXT,
ADD COLUMN     "prevpassword" TEXT,
ADD COLUMN     "status" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
