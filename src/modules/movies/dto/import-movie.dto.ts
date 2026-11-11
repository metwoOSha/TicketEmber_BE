import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ImportMovieDto {
    @ApiProperty({ example: 550 })
    @IsInt()
    @Min(1)
    tmdbId: number;
}
