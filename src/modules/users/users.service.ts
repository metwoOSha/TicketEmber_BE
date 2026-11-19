import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService) {}

    async findByEmail(email: string) {
        return await this.prismaService.user.findUnique({ where: { email } });
    }

    async create(email: string, passwordHash: string) {
        return await this.prismaService.user.create({
            data: {
                email,
                passwordHash,
            },
        });
    }

    async findById(id: string) {
        return await this.prismaService.user.findUnique({ where: { id } });
    }
}
