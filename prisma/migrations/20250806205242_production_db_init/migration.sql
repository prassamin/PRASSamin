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

-- CreateIndex
CREATE UNIQUE INDEX "project_view_trackers_slug_visitor_id_key" ON "project_view_trackers"("slug", "visitor_id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_view_trackers_slug_visitor_id_key" ON "blog_view_trackers"("slug", "visitor_id");

-- AddForeignKey
ALTER TABLE "project_view_trackers" ADD CONSTRAINT "project_view_trackers_slug_fkey" FOREIGN KEY ("slug") REFERENCES "project_stats"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_view_trackers" ADD CONSTRAINT "blog_view_trackers_slug_fkey" FOREIGN KEY ("slug") REFERENCES "blog_stats"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
