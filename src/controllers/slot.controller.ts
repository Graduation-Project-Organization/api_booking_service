import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { SlotService } from '../services/slot.service';

@Controller('api/v1/slots')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @Get('available/:doctorProfileId')
  async getAllAvailableSlots(
    @Param('doctorProfileId') doctorProfileId: string,
    @Query('day', new ParseIntPipe()) day: number,
    @Query('month', new ParseIntPipe()) month: number,
    @Query('year', new ParseIntPipe()) year: number,
    @Query('timezone') timezone: string,
  ) {
    if (!timezone) {
      timezone = 'Africa/Cairo';
    }
    return this.slotService.getAllAvailableSlots(
      doctorProfileId,
      { day, month, year },
      timezone,
    );
  }
}
