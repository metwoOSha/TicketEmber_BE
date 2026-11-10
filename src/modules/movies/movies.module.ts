import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller.js';
import { MoviesService } from './movies.service.js';
import { TmdbService } from './tmdb.service.js';

@Module({
    controllers: [MoviesController],
    providers: [MoviesService, TmdbService],
})
export class MoviesModule {}
