-- CreateEnum
CREATE TYPE "public"."TestimonialCategory" AS ENUM ('SOFTWARE_ENGINEER', 'GUESTBOOK', 'MENTOR');

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