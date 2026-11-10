import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TmdbMovie } from './tmdb.types.js';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

@Injectable()
export class TmdbService {
    private readonly token: string;

    constructor(private readonly configService: ConfigService) {
        this.token = this.configService.getOrThrow<string>('TMDB_ACCESS_TOKEN');
    }

    async getMovie(tmdbId: number): Promise<TmdbMovie> {
        const response = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                accept: 'application/json',
            },
        });

        if (response.status === 404) {
            throw new NotFoundException(`Movie ${tmdbId} not found in TMDB`);
        }

        if (!response.ok) {
            throw new BadGatewayException(`TMDB responded with status ${response.status}`);
        }

        return (await response.json()) as TmdbMovie;
    }
}
