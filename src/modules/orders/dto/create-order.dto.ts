import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayNotEmpty, ArrayUnique, IsArray, IsInt } from 'class-validator';

export class CreateOrderDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    screeningId: number;

    @ApiProperty({ example: [101, 102], description: 'IDs from GET /screenings/:id/seats' })
    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique()
    @ArrayMaxSize(6)
    @IsInt({ each: true })
    screeningSeatIds: number[];
}
