import { Body, Controller, Post } from '@nestjs/common';
import { ScreeningsService } from './screenings.service.js';
import { CreateScreeningDto } from './dto/create-screening.dto.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('screenings')
@Controller('screenings')
export class ScreeningsController {
    constructor(private readonly screeningsService: ScreeningsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a screening with seats for all hall seats' })
    async create(@Body() dto: CreateScreeningDto) {
        return this.screeningsService.create(dto);
    }
}
