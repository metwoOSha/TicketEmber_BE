-- CreateEnum
CREATE TYPE "screening_seat_status" AS ENUM ('FREE', 'HELD', 'SOLD');

-- CreateTable
CREATE TABLE "screening_seats" (
    "id" SERIAL NOT NULL,
    "screening_id" INTEGER NOT NULL,
    "seat_id" INTEGER NOT NULL,
    "status" "screening_seat_status" NOT NULL DEFAULT 'FREE',
    "price" INTEGER NOT NULL,
    "held_until" TIMESTAMP(3),

    CONSTRAINT "screening_seats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "screening_seats_screening_id_status_idx" ON "screening_seats"("screening_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "screening_seats_screening_id_seat_id_key" ON "screening_seats"("screening_id", "seat_id");

-- AddForeignKey
ALTER TABLE "screening_seats" ADD CONSTRAINT "screening_seats_screening_id_fkey" FOREIGN KEY ("screening_id") REFERENCES "screenings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_seats" ADD CONSTRAINT "screening_seats_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
