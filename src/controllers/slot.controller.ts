import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { SlotService } from '../services/slot.service';

@Controller('api/v1/slots')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @Get('available/:doctorId')
  async getAllAvailableSlots(
    @Param('doctorId') doctorId: string,
    @Query('day', new ParseIntPipe()) day: number,
    @Query('month', new ParseIntPipe()) month: number,
    @Query('year', new ParseIntPipe()) year: number,
    @Query('timezone') timezone: string,
  ) {
    if (!timezone) {
      timezone = 'Africa/Cairo';
    }
    return this.slotService.getAllAvailableSlots(
      doctorId,
      { day, month, year },
      timezone,
    );
  }

  @Get('first-available/:doctorId')
  async getFirstSlotAvailable(@Param('doctorId') doctorId: string) {
    return this.slotService.getFirstSlotAvailable(doctorId);
  }
}
