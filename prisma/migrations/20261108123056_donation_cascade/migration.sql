-- DropForeignKey
ALTER TABLE "donations" DROP CONSTRAINT "donations_subscription_id_fkey";

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
