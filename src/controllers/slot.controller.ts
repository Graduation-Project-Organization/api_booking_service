import { Controller, Get, Query, Param } from '@nestjs/common';
import { SlotService } from '../services/slot.service';

@Controller('slots')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @Get('available/:doctorId')
  async getAllAvailableSlots(
    @Param('doctorId') doctorId: string,
    @Query('day') day: number,
    @Query('month') month: number,
    @Query('year') year: number,
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
