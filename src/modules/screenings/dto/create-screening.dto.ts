import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, Min } from 'class-validator';

export class CreateScreeningDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @Min(1)
    movieId: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    @Min(1)
    hallId: number;

    @ApiProperty({ example: '2026-11-20T19:30:00.000Z', description: 'Start time in UTC (ISO 8601)' })
    @Type(() => Date)
    @IsDate()
    startsAt: Date;

    @ApiProperty({ example: 15000, description: 'Price of a standard seat, in kopecks' })
    @IsInt()
    @Min(1)
    standardPrice: number;

    @ApiProperty({ example: 40000, description: 'Price of a sofa, in kopecks' })
    @IsInt()
    @Min(1)
    sofaPrice: number;
}
