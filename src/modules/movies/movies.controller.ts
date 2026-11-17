import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ImportMovieDto } from './dto/import-movie.dto.js';
import { MoviesService } from './movies.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';

@ApiTags('movies')
@Controller('movies')
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) {}

    @Post('import')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Import a movie from TMDB by its id' })
    async importMovie(@Body() dto: ImportMovieDto) {
        return this.moviesService.importFromTmdb(dto.tmdbId);
    }

    @Get()
    @ApiOperation({ summary: 'List all movies' })
    async findAll() {
        return this.moviesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a movie by id' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.moviesService.findOne(id);
    }
}
