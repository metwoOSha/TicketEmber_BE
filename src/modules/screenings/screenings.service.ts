import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ScreeningSeatStatus, SeatType } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateScreeningDto } from './dto/create-screening.dto.js';

const SCREENING_BUFFER_MINUTES = 20;

@Injectable()
export class ScreeningsService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(dto: CreateScreeningDto) {
        const [movie, hall] = await Promise.all([
            this.prismaService.movie.findUnique({ where: { id: dto.movieId } }),
            this.prismaService.hall.findUnique({ where: { id: dto.hallId } }),
        ]);

        if (!movie) {
            throw new NotFoundException(`Movie ${dto.movieId} not found`);
        }

        if (!hall) {
            throw new NotFoundException(`Hall ${dto.hallId} not found`);
        }

        const durationMinutes = movie.runtimeMinutes + SCREENING_BUFFER_MINUTES;
        const endsAt = new Date(dto.startsAt.getTime() + durationMinutes * 60_000);

        const overlapping = await this.prismaService.screening.findFirst({
            where: {
                hallId: dto.hallId,
                startsAt: { lt: endsAt },
                endsAt: { gt: dto.startsAt },
            },
        });

        if (overlapping) {
            throw new ConflictException('Hall is already booked for this time');
        }

        return await this.prismaService.$transaction(async (tx) => {
            const screening = await tx.screening.create({
                data: {
                    movieId: dto.movieId,
                    hallId: dto.hallId,
                    startsAt: dto.startsAt,
                    endsAt,
                    standardPrice: dto.standardPrice,
                    sofaPrice: dto.sofaPrice,
                },
            });

            const seats = await tx.seat.findMany({
                where: { hallId: dto.hallId },
                select: { id: true, type: true },
            });

            await tx.screeningSeat.createMany({
                data: seats.map((seat) => ({
                    screeningId: screening.id,
                    seatId: seat.id,
                    price: seat.type === SeatType.SOFA ? dto.sofaPrice : dto.standardPrice,
                })),
            });

            return screening;
        });
    }

    async findAll() {
        return await this.prismaService.screening.findMany({
            where: { startsAt: { gte: new Date() } },
            orderBy: { startsAt: 'asc' },
            include: {
                movie: { select: { id: true, title: true, posterPath: true, runtimeMinutes: true } },
                hall: { select: { id: true, name: true, type: true } },
            },
        });
    }

    async findSeats(id: number) {
        const screening = await this.prismaService.screening.findUnique({ where: { id } });

        if (!screening) {
            throw new NotFoundException(`Screening ${id} not found`);
        }

        const screeningSeats = await this.prismaService.screeningSeat.findMany({
            where: { screeningId: id },
            include: { seat: true },
            orderBy: [{ seat: { row: 'asc' } }, { seat: { number: 'asc' } }],
        });

        const now = new Date();

        return screeningSeats.map((screeningSeat) => {
            const isHoldExpired =
                screeningSeat.status === ScreeningSeatStatus.HELD && screeningSeat.heldUntil !== null && screeningSeat.heldUntil <= now;

            return {
                id: screeningSeat.id,
                row: screeningSeat.seat.row,
                number: screeningSeat.seat.number,
                type: screeningSeat.seat.type,
                price: screeningSeat.price,
                status: isHoldExpired ? ScreeningSeatStatus.FREE : screeningSeat.status,
                span: screeningSeat.seat.type === SeatType.SOFA ? 3 : 1,
            };
        });
    }
}
