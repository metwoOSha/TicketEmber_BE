import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
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

        const accessToken = await this.jwtService.signAsync({ sub: user.id, role: user.role });

        return { accessToken };
    }
}
