import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, Min } from 'class-validator';

export class FindScreeningsQueryDto {
    @ApiPropertyOptional({ example: 1, description: 'Only screenings of this movie' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    movieId?: number;

    @ApiPropertyOptional({ example: '2026-11-20T00:00:00.000Z', description: 'Screenings starting at or after this time (UTC)' })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    from?: Date;

    @ApiPropertyOptional({ example: '2026-11-21T00:00:00.000Z', description: 'Screenings starting at or before this time (UTC)' })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    to?: Date;
}
