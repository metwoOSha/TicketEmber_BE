import { Controller, Get, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('ping')
export class PingController {
    constructor(private readonly prisma: PrismaService) {}

    @Post()
    create() {
        return this.prisma.ping.create({ data: {} });
    }

    @Get()
    findAll() {
        return this.prisma.ping.findMany();
    }
}
