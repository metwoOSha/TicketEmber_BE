import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';
import { RedisService } from '../../redis/redis.service.js';
import { createHash, randomBytes } from 'node:crypto';
import { Role } from '../../generated/prisma/enums.js';

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly redis: RedisService
    ) {}

    async register(dto: RegisterDto) {
        const existUser = await this.usersService.findByEmail(dto.email);

        if (existUser) {
            throw new ConflictException('Email is already registered');
        }

        const passwordHash = await argon2.hash(dto.password);

        const user = await this.usersService.create(dto.email, passwordHash);

        return { id: user.id, email: user.email, role: user.role };
    }

    async login(dto: LoginDto) {
        const user = await this.usersService.findByEmail(dto.email);

        if (!user || !(await argon2.verify(user.passwordHash, dto.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.issueTokens(user);
    }

    async refresh(refreshToken: string) {
        const hash = this.hashToken(refreshToken);

        const userId = await this.redis.get(`refresh:${hash}`);

        if (!userId) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        await this.redis.del(`refresh:${hash}`);

        const user = await this.usersService.findById(userId);

        if (!user) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        return this.issueTokens(user);
    }

    async logout(refreshToken: string) {
        const hash = this.hashToken(refreshToken);

        await this.redis.del(`refresh:${hash}`);
    }

    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    private async createRefreshToken(userId: string): Promise<string> {
        const token = randomBytes(32).toString('hex');
        const hash = this.hashToken(token);

        await this.redis.set(`refresh:${hash}`, userId, REFRESH_TTL_SECONDS);

        return token;
    }

    private async issueTokens(user: { id: string; role: Role }) {
        const accessToken = await this.jwtService.signAsync({ sub: user.id, role: user.role });
        const refreshToken = await this.createRefreshToken(user.id);

        return { accessToken, refreshToken };
    }
}
