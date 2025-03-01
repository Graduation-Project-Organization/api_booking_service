import { Controller, Get, Post, Put, Delete, Body, Req, UseGuards, Request, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../core/jwt-auth-guard/jwt-auth.guard';
import { CreateAvailabilityDto } from 'src/dtos/create_Availability.dto';
import { UpdateAvailability } from 'src/dtos/update_Avalability';
import { ResponseDto } from 'src/dtos/response.dto';
import { RoleGuard } from 'src/core/role/role.guard';
import { Role } from 'src/core/role/role.decorator';
import { All_Role } from 'src/types/enum';
import { AppointmentService } from 'src/services/appointment.service';
import { CreateAppointmentDto } from 'src/dtos/create_appointment.dto';
import { AppointmentQueryDto } from 'src/dtos/appointment.query.dto';


@Controller('api/v1/appointment')
@ApiBearerAuth()
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createAppointmet(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Req() req :any
  ) {
    try {
      createAppointmentDto.patientId = req.user.userId;
      const response =  await this.appointmentService.createAppointment(createAppointmentDto);
      return ResponseDto.ok(response);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAppointments(
    @Query() queryAppointmentDto: AppointmentQueryDto,
  ) {
    try {
      const response=  await this.appointmentService.getAppointments(queryAppointmentDto)
      return ResponseDto.ok(response.data, undefined , response.paginationObj);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }
  @Delete(':appointmentId')
  @UseGuards(JwtAuthGuard)
  async deleteAppointment(
    @Param('appointmentId') appointmentId: string,
  ) {
    try {
      const response =  await this.appointmentService.deleteAppointment(appointmentId)
      return ResponseDto.ok(response);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }
  @Post('create-payment/:appointmentId')
  @UseGuards(JwtAuthGuard)
  async createPayment(
    @Param('appointmentId') appointmentId: string,
    @Req() req :any
  ) {
    try {
      const response =  await this.appointmentService.createPayment(appointmentId);
      return ResponseDto.ok(response);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }
  @Patch('capture-payment/:orderId')
  @UseGuards(JwtAuthGuard)
  async capturePayment(
    @Param('orderId') orderId: string,
    @Req() req :any
  ) {
    try {
      const response =  await this.appointmentService.capturePayment(orderId);
      return ResponseDto.ok(response);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }
  @Patch('add-meeting/:appointmentId')
  @UseGuards(JwtAuthGuard)
  async addMeeting(
    @Param('appointmentId') appointmentId: string,
    @Body() body: {doctorEmail: string},
    @Req() req :any
  ) {
    try {
      const response =  await this.appointmentService.addMeeting(appointmentId, body.doctorEmail);
      return ResponseDto.ok(response);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }
  @Patch('complete-payment/:appointmentId')
  @UseGuards(JwtAuthGuard)
  async completePayment(
    @Param('appointmentId') appointmentId: string,
    @Req() req :any
  ) {
    try {
      const response =  await this.appointmentService.completePayment(appointmentId);
      return ResponseDto.ok(response);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }
}