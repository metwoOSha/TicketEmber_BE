import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TmdbService } from './tmdb.service.js';

@Controller('movies')
export class MoviesController {
    constructor(private readonly tmdbService: TmdbService) {}

    @Get('tmdb/:id')
    async getMovie(@Param('id', ParseIntPipe) id: number) {
        return await this.tmdbService.getMovie(id);
    }
}
