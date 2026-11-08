/*
  Warnings:

  - You are about to drop the `Ping` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "HallType" AS ENUM ('SMALL', 'STANDARD', 'THREE_D');

-- CreateEnum
CREATE TYPE "SeatType" AS ENUM ('STANDARD', 'SOFA');

-- DropTable
DROP TABLE "Ping";

-- CreateTable
CREATE TABLE "Hall" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "HallType" NOT NULL,
    "columns" INTEGER NOT NULL,

    CONSTRAINT "Hall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seat" (
    "id" SERIAL NOT NULL,
    "hallId" INTEGER NOT NULL,
    "row" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "type" "SeatType" NOT NULL DEFAULT 'STANDARD',

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hall_name_key" ON "Hall"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_hallId_row_number_key" ON "Seat"("hallId", "row", "number");

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_hallId_fkey" FOREIGN KEY ("hallId") REFERENCES "Hall"("id") ON DELETE CASCADE ON UPDATE CASCADE;
