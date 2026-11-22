import { ConfigModule } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { OrdersService } from '../src/modules/orders/orders.service.js';
import { databaseConfig } from '../src/config/database.config.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { OrdersModule } from '../src/modules/orders/orders.module.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('OrdersService.create validation', () => {
    let moduleRef: TestingModule;
    let prisma: PrismaService;
    let ordersService: OrdersService;
    let userId: string;
    let movieId: number;
    let pastScreeningId: number;

    beforeAll(async () => {
        if (!process.env['DATABASE_URL']?.includes('_test')) {
            throw new Error('Refusing to run: DATABASE_URL is not a test database');
        }

        moduleRef = await Test.createTestingModule({
            imports: [ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig] }), PrismaModule, OrdersModule],
        }).compile();

        await moduleRef.init();

        prisma = moduleRef.get(PrismaService);
        ordersService = moduleRef.get(OrdersService);

        const user = await prisma.user.create({
            data: {
                email: `validation-${Date.now()}@test.local`,
                passwordHash: 'not-a-real-hash',
            },
        });
        userId = user.id;

        const hall = await prisma.hall.findFirstOrThrow({ where: { name: 'Small Hall' } });

        const movie = await prisma.movie.create({
            data: {
                tmdbId: 800000 + Math.floor(Math.random() * 100000),
                title: 'Validation Test Movie',
                runtimeMinutes: 90,
            },
        });
        movieId = movie.id;

        const startsAt = new Date(Date.now() - 60 * 60 * 1000);
        const endsAt = new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);

        const screening = await prisma.screening.create({
            data: {
                movieId,
                hallId: hall.id,
                startsAt,
                endsAt,
                standardPrice: 15000,
                sofaPrice: 25000,
            },
        });
        pastScreeningId = screening.id;
    });

    afterAll(async () => {
        await prisma.screening.delete({ where: { id: pastScreeningId } });
        await prisma.movie.delete({ where: { id: movieId } });
        await prisma.user.delete({ where: { id: userId } });
        await moduleRef.close();
    });

    it('throws NotFound when the screening does not exist', async () => {
        await expect(ordersService.create(userId, { screeningId: 999999, screeningSeatIds: [1] })).rejects.toBeInstanceOf(
            NotFoundException
        );
    });

    it('throws BadRequest when the screening has already started', async () => {
        await expect(ordersService.create(userId, { screeningId: pastScreeningId, screeningSeatIds: [1] })).rejects.toBeInstanceOf(
            BadRequestException
        );
    });
});
