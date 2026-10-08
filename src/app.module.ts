import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { PingModule } from './ping/ping.module.js';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, PingModule],
})
export class AppModule {}
