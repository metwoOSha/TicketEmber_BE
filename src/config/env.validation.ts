import { plainToInstance } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsString, Max, Min, validateSync } from 'class-validator';

export enum NodeEnv {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}

export class EnvironmentVariables {
    @IsEnum(NodeEnv)
    NODE_ENV: NodeEnv = NodeEnv.Development;

    @IsInt()
    @Min(1)
    @Max(65535)
    PORT: number = 3000;

    @IsString()
    @IsNotEmpty()
    DATABASE_URL: string;

    @IsString()
    // @IsNotEmpty()
    REDIS_URL: string;

    @IsString()
    @IsNotEmpty()
    TMDB_ACCESS_TOKEN: string;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
    const validated = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
    const errors = validateSync(validated, { skipMissingProperties: false });

    if (errors.length > 0) {
        const details = errors.map((error) => `  - ${error.property}: ${Object.values(error.constraints ?? {}).join(', ')}`).join('\n');
        throw new Error(`Invalid environment variables:\n${details}`);
    }

    return validated;
}
