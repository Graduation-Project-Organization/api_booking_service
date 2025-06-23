import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from '../models/appointment';
import { Availability, AvailabilityDocument } from '../models/availability';
import { PayPalService } from './paypal.service';
import { ApiService } from '../core/api/api.service';
import { AppointmentQueryDto } from '../dtos/appointment.query.dto';
import { CreateAppointmentDto } from '../dtos/create_appointment.dto';
import { Working } from '../models/slot.entity';
import { ZoomService } from './zoom.service';
import { DateTime } from 'luxon';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Availability.name)
    private availabilityModel: Model<AvailabilityDocument>,
    private paypalService: PayPalService,
    private apiService: ApiService<AppointmentDocument, AppointmentQueryDto>,
    @InjectModel(Working.name)
    private workingModel: Model<Working>,
    private zoomService: ZoomService,
  ) {}
  toUTC(dateStr: string): string {
    const hasTimeZone = /[zZ]|([+-]\d{2}:\d{2})$/.test(dateStr);

    const dt = hasTimeZone
      ? DateTime.fromISO(dateStr).toUTC() // has Z or +hh:mm offset
      : DateTime.fromISO(dateStr, { zone: 'Africa/Cairo' }).toUTC(); // assume Egypt time

    return dt.toISO(); // always returns UTC in ISO format
  }

  async createAppointment(body: CreateAppointmentDto) {
    body.doctorProfileId = body.doctorId;
    const availability = await this.availabilityModel.findOne({
      profileId: body.doctorProfileId,
    });
    console.log('availability is', availability);
    body.appointmentDateTime = this.toUTC(body.appointmentDateTime);
    body.appointmentFormattedDate = body.appointmentDateTime;
    body.appointmentDate = body.appointmentDateTime;
    const from = new Date(
      new Date(body.appointmentDateTime).getTime() - 2 * 60 * 1000,
    );
    const to = new Date(
      new Date(body.appointmentDateTime).getTime() + 2 * 60 * 1000,
    );
    const available = await this.workingModel.findOne({
      from: { $gt: from, $lt: to },
      doctorProfileId: body.doctorProfileId,
    });
    if (!available) {
      throw new NotFoundException('Doctor is not available at this time.');
    }
    const appointment = await this.appointmentModel.create(body);
    appointment.charge = availability.session_price;
    appointment.interval = availability.interval;
    await available.deleteOne();
    appointment.appointmentEndTime = new Date(
      new Date(appointment.appointmentDateTime).getTime() +
        appointment.interval * 60 * 1000,
    );
    await appointment.save();
    return appointment;
  }
  async deleteAppointment(id: string) {
    const appointment = await this.appointmentModel.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true },
    );
    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }
    await this.workingModel.create({
      from: appointment.appointmentDateTime,
      doctorProfileId: appointment.doctorProfileId,
    });
    return 'appointment cancelled successfully';
  }
  async createPayment(appointmentId: string) {
    const appointment = await this.appointmentModel.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }
    const { url, orderId } = await this.paypalService.createOrder({
      refId: appointment._id.toString(),
      name: appointment.firstName,
      price: appointment.charge,
      description: 'appointment booking',
      user: appointment.patientId,
    });
    appointment.orderId = orderId;
    await appointment.save();
    return { url };
  }
  async capturePayment(orderId: string) {
    const result = await this.paypalService.capturePayment(orderId);
    console.log(result);
    const appointment = await this.appointmentModel.findOne({
      orderId: result,
    });
    if (!appointment) {
      return false;
    }
    appointment.status = 'confirmed';
    const updatedAppointmet = await appointment.save();
    console.log(updatedAppointmet);
    return updatedAppointmet;
  }
  async completePayment(id: string) {
    const appointment = await this.appointmentModel.findByIdAndUpdate(
      id,
      { status: 'completed' },
      { new: true },
    );
    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }
    return appointment;
  }
  async getAppointments(queryStr) {
    const Query = { ...queryStr };
    const { query, paginationObj } = await this.apiService.getAllDocs(
      this.appointmentModel.find(),
      Query,
    );
    const data = await query;
    return {
      data,
      paginationObj,
    };
  }

  async addZoomMeating(appointmentId) {
    const appointment = await this.appointmentModel.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException(`Appointment not found`);
    }
    if (appointment.startUrl && appointment.joinUrl) {
      throw new NotFoundException(`Meeting already created`);
    }
    if (appointment.status != 'confirmed') {
      throw new BadRequestException(`User should pay before add meating`);
    }
    const availability = await this.availabilityModel.findOne({
      doctorProfileId: appointment.doctorProfileId,
    });
    const meatingDetails = await this.zoomService.createMeeting(
      'meating topic',
      availability.interval,
      appointment.appointmentFormattedDate,
    );
    appointment.startUrl = meatingDetails.start_url;
    appointment.joinUrl = meatingDetails.join_url;
    await appointment.save();
    return appointment;
  }
}
