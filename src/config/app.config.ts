import { ConfigType, registerAs } from '@nestjs/config';
import { NodeEnv } from './env.validation.js';

export const appConfig = registerAs('app', () => ({
    nodeEnv: (process.env.NODE_ENV ?? NodeEnv.Development) as NodeEnv,
    port: Number(process.env.PORT ?? 3000),
}));

export type AppConfig = ConfigType<typeof appConfig>;
