-- CreateTable
CREATE TABLE "public"."ProjectStat" (
    "slug" TEXT NOT NULL,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectStat_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "public"."ProjectViewTracker" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "country" TEXT NOT NULL,

    CONSTRAINT "ProjectViewTracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogStat" (
    "slug" TEXT NOT NULL,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogStat_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "public"."BlogViewTracker" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "country" TEXT NOT NULL,

    CONSTRAINT "BlogViewTracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Experience" (
    "id" SERIAL NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "description" TEXT,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Education" (
    "id" SERIAL NOT NULL,
    "school" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "description" TEXT,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectViewTracker_slug_visitorId_key" ON "public"."ProjectViewTracker"("slug", "visitorId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogViewTracker_slug_visitorId_key" ON "public"."BlogViewTracker"("slug", "visitorId");

-- AddForeignKey
ALTER TABLE "public"."ProjectViewTracker" ADD CONSTRAINT "ProjectViewTracker_slug_fkey" FOREIGN KEY ("slug") REFERENCES "public"."ProjectStat"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogViewTracker" ADD CONSTRAINT "BlogViewTracker_slug_fkey" FOREIGN KEY ("slug") REFERENCES "public"."BlogStat"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
