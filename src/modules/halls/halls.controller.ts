import { Controller, Get } from '@nestjs/common';
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
}
