import { Injectable, NotFoundException } from '@nestjs/common';
import { countRows } from '../../common/utils/count-rows.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class HallsService {
    constructor(private readonly prismaService: PrismaService) {}

    async findAll() {
        return await this.prismaService.hall.findMany({ orderBy: { id: 'asc' } });
    }

    async findOne(id: number) {
        const hall = await this.prismaService.hall.findUnique({
            where: { id },
            include: { seats: { orderBy: [{ row: 'asc' }, { number: 'asc' }] } },
        });

        if (!hall) {
            throw new NotFoundException(`Hall ${id} not found`);
        }

        const { seats, ...rest } = hall;
        return {
            ...rest,
            rowsCount: countRows(seats),
            seatsCount: seats.length,
            seats,
        };
    }
}
