import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ImportMovieDto } from './dto/import-movie.dto.js';
import { MoviesService } from './movies.service.js';

@ApiTags('movies')
@Controller('movies')
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) {}

    @Post('import')
    @ApiOperation({ summary: 'Import a movie from TMDB by its id' })
    async importMovie(@Body() dto: ImportMovieDto) {
        return this.moviesService.importFromTmdb(dto.tmdbId);
    }
}
