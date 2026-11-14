import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { SeatType } from '../../generated/prisma/client.js';
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
}
