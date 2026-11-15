import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService) {}

    async register(dto: RegisterDto) {
        const existUser = await this.usersService.findByEmail(dto.email);

        if (existUser) {
            throw new ConflictException('Email is already registered');
        }

        const passwordHash = await argon2.hash(dto.password);

        const user = await this.usersService.create(dto.email, passwordHash);

        return { id: user.id, email: user.email, role: user.role };
    }
}
