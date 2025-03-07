import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Req,
  UseGuards,
  Param,
  Patch,
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
  ) {
    try {
      createAvailabilityDto.doctorId = req.user.userId;
      const response = await this.availabilityService.createAvailability(
        createAvailabilityDto,
      );
      return ResponseDto.ok(response);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }

  @Get(':doctorId')
  @UseGuards(JwtAuthGuard)
  async getAvailability(@Param('doctorId') doctorId: string) {
    try {
      const response = await this.availabilityService.getAvailability(doctorId);
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
  ) {
    try {
      const doctorId = req.user.userId;
      const response = await this.availabilityService.updateAvailability(
        doctorId,
        updateAvailabilityDto,
      );
      return ResponseDto.ok(response);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role([All_Role.Doctor])
  async deleteAvailability(@Req() req: any) {
    try {
      const doctorId = req.user.userId;
      const response =
        await this.availabilityService.deleteAvailability(doctorId);
      return ResponseDto.ok(response);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }
}
