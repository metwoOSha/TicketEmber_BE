import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class HallsService {
    constructor(private readonly prismaService: PrismaService) {}

    async findAll() {
        return await this.prismaService.hall.findMany({ orderBy: { id: 'asc' } });
    }
}
