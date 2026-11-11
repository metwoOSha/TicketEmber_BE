import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { TmdbService } from './tmdb.service.js';

@Injectable()
export class MoviesService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly tmdbService: TmdbService
    ) {}

    async importFromTmdb(tmdbId: number) {
        const savedMovie = await this.prismaService.movie.findUnique({ where: { tmdbId } });

        if (savedMovie) return savedMovie;

        const tmdbMovie = await this.tmdbService.getMovie(tmdbId);

        if (!tmdbMovie.runtime) {
            throw new UnprocessableEntityException(`Movie ${tmdbId} has no runtime in TMDB and cannot be imported`);
        }

        return await this.prismaService.movie.create({
            data: {
                tmdbId: tmdbMovie.id,
                title: tmdbMovie.title,
                overview: tmdbMovie.overview || null,
                runtimeMinutes: tmdbMovie.runtime,
                posterPath: tmdbMovie.poster_path,
                releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
                genres: tmdbMovie.genres.map((genre) => genre.name),
                rating: tmdbMovie.vote_average,
            },
        });
    }

    async findAll() {
        return await this.prismaService.movie.findMany({ orderBy: { createdAt: 'desc' } });
    }

    async findOne(id: number) {
        const movie = await this.prismaService.movie.findUnique({
            where: { id },
        });

        if (!movie) {
            throw new NotFoundException(`Movie ${id} not found`);
        }

        return movie;
    }
}
