/*
  Warnings:

  - You are about to drop the `BlogStat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BlogViewTracker` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Donation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Donor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Education` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Experience` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectStat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectViewTracker` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Testimonial` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BlogViewTracker" DROP CONSTRAINT "BlogViewTracker_slug_fkey";

-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_donorEmail_fkey";

-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectViewTracker" DROP CONSTRAINT "ProjectViewTracker_slug_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_donorEmail_fkey";

-- DropTable
DROP TABLE "BlogStat";

-- DropTable
DROP TABLE "BlogViewTracker";

-- DropTable
DROP TABLE "Donation";

-- DropTable
DROP TABLE "Donor";

-- DropTable
DROP TABLE "Education";

-- DropTable
DROP TABLE "Experience";

-- DropTable
DROP TABLE "ProjectStat";

-- DropTable
DROP TABLE "ProjectViewTracker";

-- DropTable
DROP TABLE "Subscription";

-- DropTable
DROP TABLE "Testimonial";

-- CreateTable
CREATE TABLE "project_stats" (
    "slug" TEXT NOT NULL,
    "total_views" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_stats_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "project_view_trackers" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "last_seen" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "country" TEXT NOT NULL,

    CONSTRAINT "project_view_trackers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_stats" (
    "slug" TEXT NOT NULL,
    "total_views" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_stats_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "blog_view_trackers" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "last_seen" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "country" TEXT NOT NULL,

    CONSTRAINT "blog_view_trackers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiences" (
    "id" SERIAL NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "description" TEXT,
    "company_url" TEXT,
    "company_logo" TEXT,
    "location" TEXT,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donors" (
    "email" TEXT NOT NULL,
    "name" TEXT,
    "social_url" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donors_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "donor_email" TEXT NOT NULL,
    "product_id" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "interval" TEXT NOT NULL DEFAULT 'month',
    "status" TEXT NOT NULL DEFAULT 'active',
    "current_period_start" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" SERIAL NOT NULL,
    "donor_email" TEXT NOT NULL,
    "subscription_id" TEXT,
    "checkout_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "frequency" TEXT NOT NULL DEFAULT 'once',
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education" (
    "id" SERIAL NOT NULL,
    "school" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "description" TEXT,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" SERIAL NOT NULL,
    "quote" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "category" "TestimonialCategory" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_view_trackers_slug_visitor_id_key" ON "project_view_trackers"("slug", "visitor_id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_view_trackers_slug_visitor_id_key" ON "blog_view_trackers"("slug", "visitor_id");

-- CreateIndex
CREATE UNIQUE INDEX "donations_checkout_id_key" ON "donations"("checkout_id");

-- AddForeignKey
ALTER TABLE "project_view_trackers" ADD CONSTRAINT "project_view_trackers_slug_fkey" FOREIGN KEY ("slug") REFERENCES "project_stats"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_view_trackers" ADD CONSTRAINT "blog_view_trackers_slug_fkey" FOREIGN KEY ("slug") REFERENCES "blog_stats"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_donor_email_fkey" FOREIGN KEY ("donor_email") REFERENCES "donors"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_donor_email_fkey" FOREIGN KEY ("donor_email") REFERENCES "donors"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
