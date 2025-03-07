import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from '../models/appointment';
import { Availability, AvailabilityDocument } from '../models/availability';
import { CreateAvailabilityDto } from '../dtos/create_Availability.dto';
import { UpdateAvailability } from '../dtos/update_Avalability';

@Injectable()
export class AvailabilityService {
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
      throw new NotFoundException('Doctor dont have aviablity');
    }
    availability.isDelete = true;
    await availability.save();
    return 'availability deleted successfully';
  }
  async updateAvailability(doctorId: string, body: UpdateAvailability) {
    const availability = await this.availabilityModel.findOne({
      doctorId,
      isDelete: false,
    });
    if (!availability) {
      throw new NotFoundException('Doctor dont have aviablity');
    }
    const updatedAvaialability = await this.availabilityModel.findByIdAndUpdate(
      availability._id,
      body,
      {
        new: true,
      },
    );
    return updatedAvaialability;
  }
  async getAvailability(doctorId: string) {
    const availability = await this.availabilityModel.findOne({
      doctorId,
      isDelete: false,
    });
    console.log('availability', availability);
    if (!availability) {
      throw new NotFoundException('Doctor dont have aviablity');
    }
    return availability;
  }
}
