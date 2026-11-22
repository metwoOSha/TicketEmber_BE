import { ConflictException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { databaseConfig } from '../src/config/index.js';
import { OrdersModule } from '../src/modules/orders/orders.module.js';
import { OrdersService } from '../src/modules/orders/orders.service.js';
import { ScreeningsModule } from '../src/modules/screenings/screenings.module.js';
import { ScreeningsService } from '../src/modules/screenings/screenings.service.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Orders race condition', () => {
    let moduleRef: TestingModule;
    let prisma: PrismaService;
    let ordersService: OrdersService;

    let userId: string;
    let movieId: number;
    let screeningId: number;
    let seatIds: number[];

    beforeAll(async () => {
        if (!process.env['DATABASE_URL']?.includes('_test')) {
            throw new Error('Refusing to run: DATABASE_URL is not a test database');
        }

        moduleRef = await Test.createTestingModule({
            imports: [ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig] }), PrismaModule, OrdersModule, ScreeningsModule],
        }).compile();

        await moduleRef.init();

        prisma = moduleRef.get(PrismaService);
        ordersService = moduleRef.get(OrdersService);
        const screeningsService = moduleRef.get(ScreeningsService);

        const hall = await prisma.hall.findFirstOrThrow({ where: { name: 'Small Hall' } });

        const movie = await prisma.movie.create({
            data: {
                tmdbId: 900000 + Math.floor(Math.random() * 100000),
                title: 'Race Test Movie',
                runtimeMinutes: 90,
            },
        });
        movieId = movie.id;

        const user = await prisma.user.create({
            data: { email: `race-${Date.now()}@test.local`, passwordHash: 'not-a-real-hash' },
        });
        userId = user.id;

        const screening = await screeningsService.create({
            movieId,
            hallId: hall.id,
            startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            standardPrice: 15000,
            sofaPrice: 25000,
        });
        screeningId = screening.id;

        const seats = await prisma.screeningSeat.findMany({
            where: { screeningId },
            select: { id: true },
            orderBy: { id: 'asc' },
        });
        seatIds = seats.map((seat) => seat.id);
    });

    afterAll(async () => {
        await prisma.order.deleteMany({ where: { screeningId } });
        await prisma.screening.delete({ where: { id: screeningId } });
        await prisma.movie.delete({ where: { id: movieId } });
        await prisma.user.delete({ where: { id: userId } });

        await moduleRef.close();
    });

    it('prepares a screening with seats', () => {
        expect(seatIds.length).toBeGreaterThan(0);
        expect(ordersService).toBeDefined();
    });

    it('lets only one of many parallel requests take the same seat', async () => {
        const seatId = seatIds[0]!;
        const attempts = 10;

        const results = await Promise.allSettled(
            Array.from({ length: attempts }, () => ordersService.create(userId, { screeningId, screeningSeatIds: [seatId] }))
        );

        const fulfilled = results.filter((r) => r.status === 'fulfilled');
        const rejected = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');

        expect(fulfilled).toHaveLength(1);
        expect(rejected).toHaveLength(attempts - 1);
        for (const result of rejected) {
            expect(result.reason).toBeInstanceOf(ConflictException);
        }

        expect(await prisma.order.count({ where: { orderItems: { some: { screeningSeatId: seatId } } } })).toBe(1);

        const seat = await prisma.screeningSeat.findUniqueOrThrow({ where: { id: seatId } });
        expect(seat.status).toBe('HELD');
    });

    it('lets a seat with an expired hold be taken again', async () => {
        const seatId = seatIds[1]!;

        await prisma.screeningSeat.update({
            where: { id: seatId },
            data: { status: 'HELD', heldUntil: new Date(Date.now() - 60 * 1000) },
        });

        const order = await ordersService.create(userId, { screeningId, screeningSeatIds: [seatId] });

        expect(order.orderItems).toHaveLength(1);

        const seat = await prisma.screeningSeat.findUniqueOrThrow({ where: { id: seatId } });
        expect(seat.status).toBe('HELD');
        expect(seat.heldUntil!.getTime()).toBeGreaterThan(Date.now());
    });

    it('does not let a seat with an active hold be taken', async () => {
        const seatId = seatIds[2]!;

        await prisma.screeningSeat.update({
            where: { id: seatId },
            data: { status: 'HELD', heldUntil: new Date(Date.now() + 10 * 60 * 1000) },
        });

        await expect(ordersService.create(userId, { screeningId, screeningSeatIds: [seatId] })).rejects.toBeInstanceOf(ConflictException);
    });

    it('does not let a sold seat be taken', async () => {
        const seatId = seatIds[3]!;

        await prisma.screeningSeat.update({
            where: { id: seatId },
            data: { status: 'SOLD' },
        });

        await expect(ordersService.create(userId, { screeningId, screeningSeatIds: [seatId] })).rejects.toBeInstanceOf(ConflictException);
    });
});
