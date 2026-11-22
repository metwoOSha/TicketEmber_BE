import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create an order and hold seats for 15 minutes' })
    create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
        return this.ordersService.create(user.id, dto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List my orders' })
    findAllByUser(@CurrentUser() user: AuthUser) {
        return this.ordersService.findAllByUser(user.id);
    }

    @Post(':id/cancel')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cancel a pending order and release its seats' })
    cancel(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
        return this.ordersService.cancel(user.id, id);
    }
}
