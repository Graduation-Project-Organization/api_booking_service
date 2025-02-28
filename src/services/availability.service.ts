import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from 'src/models/appointment';
import { Availability, AvailabilityDocument } from 'src/models/availability';
import { CreateAvailabilityDto } from 'src/dtos/create_Availability.dto';
import { UpdateAvailability } from 'src/dtos/update_Avalability';

@Injectable()
export class ApointmentService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Availability.name)
    private availabilityModel: Model<AvailabilityDocument>,
  ) {}
  async createAvailability(body: CreateAvailabilityDto) {
    const availabilityExist = await this.availabilityModel.findOne({
      doctorId: body.doctorId,
      isDelete: false,
    });
    if (availabilityExist) {
      throw new NotFoundException('Doctor have an availability');
    }
    const availability = await this.availabilityModel.create(body);
    return availability;
  }
  async deleteAvailability(doctorId: string) {
    const availability = await this.availabilityModel.findOne({
      doctorId,
      isDelete: false,
    });
    if (!availability) {
      throw new NotFoundException('Doctor not found');
    }
    availability.isDelete = true;
    await availability.save();
    return availability;
  }
  async updateAvailability(doctorId: string, body: UpdateAvailability) {
    const availability = await this.availabilityModel.findOne({
      doctorId,
      isDelete: false,
    });
    if (!availability) {
      throw new NotFoundException('Doctor not found');
    }
    await this.availabilityModel.findByIdAndUpdate(availability._id, body, {
      new: true,
    });
    return availability;
  }
  async getAvailability(doctorId: string) {
    const availability = await this.availabilityModel.findOne({
      doctorId,
      isDelete: false,
    });
    return availability;
  }
}
