import { ConfigType, registerAs } from '@nestjs/config';

export const redisConfig = registerAs('redis', () => ({
    url: process.env.REDIS_URL as string,
}));

export type RedisConfig = ConfigType<typeof redisConfig>;
