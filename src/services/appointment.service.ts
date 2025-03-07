import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from '../models/appointment';
import { Availability, AvailabilityDocument } from '../models/availability';
import { PayPalService } from './paypal.service';
import { ApiService } from '../core/api/api.service';
import { AppointmentQueryDto } from '../dtos/appointment.query.dto';
import { CreateAppointmentDto } from '../dtos/create_appointment.dto';
@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Availability.name)
    private availabilityModel: Model<AvailabilityDocument>,
    private paypalService: PayPalService,
    private apiService: ApiService<AppointmentDocument, AppointmentQueryDto>,
  ) {}
  getDayFromDate(date: Date): string {
    const daysOfWeek = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    return daysOfWeek[date.getDay()];
  }
  async createAppointment(body: CreateAppointmentDto) {
    const availability = await this.availabilityModel.findOne({
      doctorId: body.doctorId,
      isDelete: false,
    });
    console.log('availabilityyy', availability);
    if (!availability) {
      throw new NotFoundException(
        'Doctor is not available at the selected time.',
      );
    }
    const appointmentDate = new Date(body.appointmentDate);
    const doctorAppointment = await this.appointmentModel.findOne({
      appointmentDate,
      appointmentTime: body.appointmentTime,
      doctorId: body.doctorId,
    });
    if (doctorAppointment) {
      throw new NotFoundException(
        'Doctor is already booked at the selected time.',
      );
    }
    const day = this.getDayFromDate(appointmentDate);
    console.log(day);
    console.log(availability[day]);
    if (!availability[day].includes(body.appointmentTime)) {
      throw new NotFoundException(
        'Doctor is not available at the selected time.',
      );
    }
    availability[day] = availability[day].filter(
      (time) => time != body.appointmentTime,
    );
    await availability.save();
    const appointment = await this.appointmentModel.create(body);
    appointment.charge = availability.session_price;
    appointment.interval = availability.interval;
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
    const availability = await this.availabilityModel.findOne({
      doctorId: appointment.doctorId,
      isDelete: false,
    });
    if (!availability) {
      throw new NotFoundException('Doctor not found.');
    }
    availability[this.getDayFromDate(appointment.appointmentDate)].push(
      appointment.appointmentTime,
    );
    await availability.save();
    return 'appointment cancelled successfully';
  }
  async createPayment(appointmentId: string) {
    const appointment = await this.appointmentModel.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }
    const { url, orderId } = await this.paypalService.createOrder({
      refId: appointment._id.toString(),
      name: appointment.first_name,
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
  async getAppointments(queryStr: AppointmentQueryDto) {
    const Query = { ...queryStr, status: { $ne: 'cancelled' } };
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
}
