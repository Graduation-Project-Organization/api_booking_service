import {
  Controller,
  Get,
  // Post,
  Body,
  // Req,
  UseGuards,
  // Param,
  Patch,
  Query,
  Param,
  Req,
  // Delete,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../core/jwt-auth-guard/jwt-auth.guard';
import { AvailabilityService } from '../services/availability.service';
import { UpdateAvailability } from '../dtos/update_Avalability';
import { ResponseDto } from '../dtos/response.dto';
import { RoleGuard } from '../core/role/role.guard';
import { Role } from '../core/role/role.decorator';
import { All_Role } from '../types/enum';

@Controller('api/v1/availability')
@ApiBearerAuth()
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('/:doctorProfileId')
  async getAvailability(
    @Query('timezone') timezone: string,
    @Param('doctorProfileId') doctorProfileId: string,
  ) {
    try {
      if (!timezone) {
        timezone = 'Africa/Cairo';
      }
      const response = await this.availabilityService.getAvailability(
        doctorProfileId,
        timezone,
      );
      return ResponseDto.ok(response);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }

  @Patch('/:doctorProfileId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role([All_Role.Doctor])
  async updateAvailability(
    @Body() updateAvailabilityDto: UpdateAvailability,
    @Query('timezone') timezone: string,
    @Param('doctorProfileId') doctorProfileId: string,
    @Req() req: any,
  ) {
    if (!timezone) {
      timezone = 'Africa/Cairo';
    }
    try {
      const response = await this.availabilityService.updateAvailability(
        doctorProfileId,
        req.user.userId,
        updateAvailabilityDto,
        timezone,
      );
      return ResponseDto.ok(response);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }
}
