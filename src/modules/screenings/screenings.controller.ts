import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateScreeningDto } from './dto/create-screening.dto.js';
import { ScreeningsService } from './screenings.service.js';
import { FindScreeningsQueryDto } from './dto/find-screenings-query.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';

@ApiTags('screenings')
@Controller('screenings')
export class ScreeningsController {
    constructor(private readonly screeningsService: ScreeningsService) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a screening with seats for all hall seats' })
    async create(@Body() dto: CreateScreeningDto) {
        return this.screeningsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'List upcoming screenings' })
    async findAll(@Query() query: FindScreeningsQueryDto) {
        return this.screeningsService.findAll(query);
    }

    @Get(':id/seats')
    @ApiOperation({ summary: 'Seat map of a screening with statuses and prices' })
    async findSeats(@Param('id', ParseIntPipe) id: number) {
        return this.screeningsService.findSeats(id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a screening by id' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.screeningsService.findOne(id);
    }
}
