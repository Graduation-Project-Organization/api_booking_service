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
  Query,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../core/jwt-auth-guard/jwt-auth.guard';
import { ResponseDto } from '../dtos/response.dto';
import { AppointmentService } from '../services/appointment.service';
import { CreateAppointmentDto } from '../dtos/create_appointment.dto';
import {
  AppointmentQueryDto,
  DoctorAppointmentQueryDto,
  PatientAppointmentQueryDto,
} from '../dtos/appointment.query.dto';
import { Response } from 'express';

@Controller('api/v1/appointment')
@ApiBearerAuth()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createAppointmet(@Body() body: CreateAppointmentDto, @Req() req: any) {
    try {
      body.patientId = req.user.userId;
      const response = await this.appointmentService.createAppointment(body);
      return ResponseDto.ok(response);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAppointments(@Query() queryAppointmentDto: AppointmentQueryDto) {
    try {
      // console.log('queryAppointmentDto', queryAppointmentDto);
      const response =
        await this.appointmentService.getAppointments(queryAppointmentDto);
      return ResponseDto.ok(response.data, undefined, response.paginationObj);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }

  @Get('doctor')
  @UseGuards(JwtAuthGuard)
  async getDoctorAppointments(
    @Query() queryAppointmentDto: DoctorAppointmentQueryDto,
  ) {
    try {
      // console.log('queryAppointmentDto', queryAppointmentDto);
      const response =
        await this.appointmentService.getAppointments(queryAppointmentDto);
      return ResponseDto.ok(response.data, undefined, response.paginationObj);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }

  @Get('patient')
  @UseGuards(JwtAuthGuard)
  async getPatientAppointments(
    @Query() queryAppointmentDto: PatientAppointmentQueryDto,
  ) {
    try {
      // console.log('queryAppointmentDto', queryAppointmentDto);
      const response =
        await this.appointmentService.getAppointments(queryAppointmentDto);
      return ResponseDto.ok(response.data, undefined, response.paginationObj);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }

  @Delete(':appointmentId')
  @UseGuards(JwtAuthGuard)
  async deleteAppointment(@Param('appointmentId') appointmentId: string) {
    try {
      const response =
        await this.appointmentService.deleteAppointment(appointmentId);
      return ResponseDto.ok(response);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }
  @Post('create-payment/:appointmentId')
  @UseGuards(JwtAuthGuard)
  async createPayment(
    @Param('appointmentId') appointmentId: string,
    // @Req() req: any,
  ) {
    try {
      const response =
        await this.appointmentService.createPayment(appointmentId);
      return ResponseDto.ok(response);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }
  @Get('success')
  async capturePayment(
    @Query() query: { token: string },
    @Res() res: Response,
  ) {
    try {
      await this.appointmentService.capturePayment(query.token);
    } catch (err) {
      console.log('error is', err.message);
    }
    res.redirect('http://localhost:3000/dashboard/user/appointments');
  }
  @Get('cancel')
  async cancel(@Res() res: Response) {
    res.redirect('http://localhost:3000/dashboard/user/appointments');
  }

  @Post('create-zoom-meating/:appointmentId')
  @UseGuards(JwtAuthGuard)
  async createZoomMeeting(@Param('appointmentId') appointmentId: string) {
    try {
      const response =
        await this.appointmentService.addZoomMeating(appointmentId);
      return ResponseDto.ok(response);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }
  @Patch('complete-appointment/:appointmentId')
  @UseGuards(JwtAuthGuard)
  async completePayment(@Param('appointmentId') appointmentId: string) {
    try {
      const response =
        await this.appointmentService.completeAppointment(appointmentId);
      return ResponseDto.ok(response);
    } catch (err) {
      return ResponseDto.throwBadRequest(err.message, err);
    }
  }
}
