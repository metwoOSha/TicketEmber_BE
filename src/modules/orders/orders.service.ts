import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

const HOLD_MINUTES = 15;

@Injectable()
export class OrdersService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(userId: string, dto: CreateOrderDto) {
        return this.prismaService.$transaction(async (tx) => {
            const screening = await tx.screening.findUnique({ where: { id: dto.screeningId } });

            if (!screening) {
                throw new NotFoundException('The screening not found');
            }

            if (screening.startsAt <= new Date()) {
                throw new BadRequestException('Screening already started');
            }

            const now = new Date();
            const heldUntil = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);

            const result = await tx.screeningSeat.updateMany({
                where: {
                    id: { in: dto.screeningSeatIds },
                    screeningId: dto.screeningId,
                    OR: [{ status: 'FREE' }, { status: 'HELD', heldUntil: { lt: now } }],
                },
                data: { status: 'HELD', heldUntil },
            });

            if (result.count !== dto.screeningSeatIds.length) {
                throw new ConflictException('Some seats are already taken');
            }

            const seats = await tx.screeningSeat.findMany({
                where: { id: { in: dto.screeningSeatIds } },
                select: { id: true, price: true },
            });

            const totalAmount = seats.reduce((sum, seat) => sum + seat.price, 0);

            return tx.order.create({
                data: {
                    userId,
                    screeningId: dto.screeningId,
                    totalAmount,
                    expiresAt: heldUntil,
                    orderItems: {
                        create: seats.map((seat) => ({
                            screeningSeatId: seat.id,
                            price: seat.price,
                        })),
                    },
                },
                include: { orderItems: true },
            });
        });
    }

    findAllByUser(userId: string) {
        return this.prismaService.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { orderItems: true },
        });
    }

    async cancel(userId: string, orderId: string) {
        return this.prismaService.$transaction(async (tx) => {
            const order = await tx.order.findFirst({
                where: { id: orderId, userId },
                include: { orderItems: true },
            });

            if (!order) {
                throw new NotFoundException('Order not found');
            }

            const updated = await tx.order.updateMany({
                where: { id: orderId, status: 'PENDING' },
                data: { status: 'CANCELLED' },
            });

            if (updated.count === 0) {
                throw new ConflictException('Only pending orders can be cancelled');
            }

            if (order.expiresAt > new Date()) {
                await tx.screeningSeat.updateMany({
                    where: { id: { in: order.orderItems.map((item) => item.screeningSeatId) }, status: 'HELD' },
                    data: { status: 'FREE', heldUntil: null },
                });
            }

            return tx.order.findUniqueOrThrow({
                where: { id: orderId },
                include: { orderItems: true },
            });
        });
    }
}
