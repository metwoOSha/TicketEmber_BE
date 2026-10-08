import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { AppConfig, setupSwagger } from './config/index.js';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    setupSwagger(app);

    const config = app.get(ConfigService);
    await app.listen(config.getOrThrow<AppConfig['port']>('app.port'));
}
await bootstrap();
