import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateScreeningDto } from './dto/create-screening.dto.js';
import { ScreeningsService } from './screenings.service.js';

@ApiTags('screenings')
@Controller('screenings')
export class ScreeningsController {
    constructor(private readonly screeningsService: ScreeningsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a screening with seats for all hall seats' })
    async create(@Body() dto: CreateScreeningDto) {
        return this.screeningsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'List upcoming screenings' })
    async findAll() {
        return this.screeningsService.findAll();
    }

    @Get(':id/seats')
    @ApiOperation({ summary: 'Seat map of a screening with statuses and prices' })
    async findSeats(@Param('id', ParseIntPipe) id: number) {
        return this.screeningsService.findSeats(id);
    }
}
