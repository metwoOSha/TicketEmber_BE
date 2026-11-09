import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig, databaseConfig, redisConfig, validateEnv } from './config/index.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { HallsModule } from './modules/halls/halls.module.js';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: validateEnv,
            load: [appConfig, databaseConfig, redisConfig],
        }),
        PrismaModule,
        HallsModule,
    ],
})
export class AppModule {}
