import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Param,
  Patch,
  Query,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../core/jwt-auth-guard/jwt-auth.guard';
import { AvailabilityService } from '../services/availability.service';
import { CreateAvailabilityDto } from '../dtos/create_Availability.dto';
import { UpdateAvailability } from '../dtos/update_Avalability';
import { ResponseDto } from '../dtos/response.dto';
import { RoleGuard } from '../core/role/role.guard';
import { Role } from '../core/role/role.decorator';
import { All_Role } from '../types/enum';

@Controller('api/v1/availability')
@ApiBearerAuth()
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role([All_Role.Doctor])
  async createAvailability(
    @Body() createAvailabilityDto: CreateAvailabilityDto,
    @Req() req: any,
    @Query('timezone') timezone: string,
  ) {
    if (!timezone) {
      timezone = 'Africa/Cairo';
    }
    try {
      console.log('payyyy,', req.user);
      createAvailabilityDto.doctorId = req.user.userId;
      const response = await this.availabilityService.createAvailability(
        createAvailabilityDto,
        timezone,
      );
      return ResponseDto.ok(response);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }

  @Get(':doctorId')
  @UseGuards(JwtAuthGuard)
  async getAvailability(
    @Param('doctorId') doctorId: string,
    @Query('timezone') timezone: string,
  ) {
    try {
      if (!timezone) {
        timezone = 'Africa/Cairo';
      }
      const response = await this.availabilityService.getAvailability(
        doctorId,
        timezone,
      );
      return ResponseDto.ok(response);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role([All_Role.Doctor])
  async updateAvailability(
    @Body() updateAvailabilityDto: UpdateAvailability,
    @Req() req: any,
    @Query('timezone') timezone: string,
  ) {
    if (!timezone) {
      timezone = 'Africa/Cairo';
    }
    try {
      const doctorId = req.user.userId;
      const response = await this.availabilityService.updateAvailability(
        doctorId,
        updateAvailabilityDto,
        timezone,
      );
      return ResponseDto.ok(response);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role([All_Role.Doctor])
  async deleteAvaialability(
    @Req() req: any,
  ) {
    try {
      const doctorId = req.user.userId;
      const response = await this.availabilityService.deleteAvailability(doctorId);
      return ResponseDto.ok(response);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }


  

}
