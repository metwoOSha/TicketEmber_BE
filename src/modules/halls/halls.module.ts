import { Module } from '@nestjs/common';
import { HallsController } from './halls.controller.js';
import { HallsService } from './halls.service.js';

@Module({
  controllers: [HallsController],
  providers: [HallsService]
})
export class HallsModule {}
