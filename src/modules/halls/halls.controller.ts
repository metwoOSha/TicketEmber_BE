import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HallsService } from './halls.service.js';

@ApiTags('halls')
@Controller('halls')
export class HallsController {
    constructor(private readonly hallsService: HallsService) {}

    @Get()
    @ApiOperation({ summary: 'List all halls' })
    async findAll() {
        return this.hallsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'One halls by id' })
    async findOne(@Param('id') id: number) {
        return this.hallsService.findOne(id);
    }
}
