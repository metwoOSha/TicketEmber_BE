/*
  Warnings:

  - You are about to drop the `Hall` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Seat` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "hall_type" AS ENUM ('SMALL', 'STANDARD', 'THREE_D');

-- CreateEnum
CREATE TYPE "seat_type" AS ENUM ('STANDARD', 'SOFA');

-- DropForeignKey
ALTER TABLE "Seat" DROP CONSTRAINT "Seat_hallId_fkey";

-- DropTable
DROP TABLE "Hall";

-- DropTable
DROP TABLE "Seat";

-- DropEnum
DROP TYPE "HallType";

-- DropEnum
DROP TYPE "SeatType";

-- CreateTable
CREATE TABLE "halls" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "hall_type" NOT NULL,
    "columns" INTEGER NOT NULL,

    CONSTRAINT "halls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seats" (
    "id" SERIAL NOT NULL,
    "hall_id" INTEGER NOT NULL,
    "row" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "type" "seat_type" NOT NULL DEFAULT 'STANDARD',

    CONSTRAINT "seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movies" (
    "id" SERIAL NOT NULL,
    "tmdb_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "overview" TEXT,
    "runtime_minutes" INTEGER NOT NULL,
    "poster_path" TEXT,
    "release_date" TIMESTAMP(3),
    "genres" TEXT[],
    "rating" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "halls_name_key" ON "halls"("name");

-- CreateIndex
CREATE UNIQUE INDEX "seats_hall_id_row_number_key" ON "seats"("hall_id", "row", "number");

-- CreateIndex
CREATE UNIQUE INDEX "movies_tmdb_id_key" ON "movies"("tmdb_id");

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_hall_id_fkey" FOREIGN KEY ("hall_id") REFERENCES "halls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
