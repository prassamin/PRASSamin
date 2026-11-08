/*
  Warnings:

  - You are about to drop the column `donorId` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStatus` on the `Donation` table. All the data in the column will be lost.
  - The primary key for the `Donor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Donor` table. All the data in the column will be lost.
  - Added the required column `donorEmail` to the `Donation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_donorId_fkey";

-- DropIndex
DROP INDEX "Donor_email_key";

-- AlterTable
ALTER TABLE "Donation" DROP COLUMN "donorId",
DROP COLUMN "subscriptionStatus",
ADD COLUMN     "donorEmail" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Donor" DROP CONSTRAINT "Donor_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Donor_pkey" PRIMARY KEY ("email");

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "donorEmail" TEXT NOT NULL,
    "productId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "interval" TEXT NOT NULL DEFAULT 'month',
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_donorEmail_fkey" FOREIGN KEY ("donorEmail") REFERENCES "Donor"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donorEmail_fkey" FOREIGN KEY ("donorEmail") REFERENCES "Donor"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
