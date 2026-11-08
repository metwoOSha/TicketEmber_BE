import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, HallType, SeatType } from '../src/generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] });
const prisma = new PrismaClient({ adapter });

const halls = [
    { name: '3D Hall', type: HallType.THREE_D, columns: 18, standardRows: 11 },
    { name: 'Large Hall', type: HallType.STANDARD, columns: 15, standardRows: 9 },
    { name: 'Small Hall', type: HallType.SMALL, columns: 12, standardRows: 5 },
];

function buildSeats(hall: (typeof halls)[number], hallId: number) {
    const seats: { hallId: number; row: number; number: number; type: SeatType }[] = [];

    for (let row = 1; row <= hall.standardRows; row++) {
        for (let number = 1; number <= hall.columns; number++) {
            seats.push({ hallId, row, number, type: SeatType.STANDARD });
        }
    }

    const sofaRow = hall.standardRows + 1;
    const sofaCount = hall.columns / 3;
    for (let number = 1; number <= sofaCount; number++) {
        seats.push({ hallId, row: sofaRow, number, type: SeatType.SOFA });
    }

    return seats;
}

async function main() {
    for (const hall of halls) {
        const { name, type, columns } = hall;

        const created = await prisma.hall.upsert({
            where: { name },
            update: {},
            create: { name, type, columns },
        });

        const existingSeats = await prisma.seat.count({ where: { hallId: created.id } });
        if (existingSeats > 0) {
            console.log(`${name}: seats already exist (${existingSeats}), skipped`);
            continue;
        }

        const { count } = await prisma.seat.createMany({
            data: buildSeats(hall, created.id),
        });
        console.log(`${name}: created ${count} seats`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
