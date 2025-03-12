import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Availability, AvailabilityDocument } from 'src/models/availability';
import { CreateAvailabilityDto } from 'src/dtos/create_Availability.dto';
import { UpdateAvailability } from 'src/dtos/update_Avalability';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Appointment, AppointmentDocument } from 'src/models/appointment';
import { DateTime } from 'luxon';
import { SlotService } from './slot.service';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(Availability.name)
    private availabilityModel: Model<AvailabilityDocument>,
    @InjectModel(Appointment.name)
    private appointMentModel: Model<AppointmentDocument>,
    private eventEmitter: EventEmitter2,
    private slotService: SlotService,
  ) {}
  getLocalTimeFromUtc(utcTime: string, timeZone: string): string {
    // Convert UTC time to the given time zone
    const localTime = DateTime.fromFormat(utcTime, 'HH:mm', {
      zone: 'utc',
    }).setZone(timeZone);
    // Return local time in HH:mm format
    return localTime.toFormat('HH:mm');
  }
  formatAndSortTimeArray(times: string[]): string[] {
    return times
      .map((time) => {
        const [hour, minute] = time.split(':');

        // Convert to numbers for correct sorting
        return { hour: Number(hour), minute: Number(minute) };
      })
      .sort((a, b) => a.hour - b.hour || a.minute - b.minute) // Sort by hour first, then by minute
      .map(({ hour, minute }) => {
        // Format with leading zeros
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      });
  }
  getUtcTime(localTime: string, timeZone: string): string {
    // Convert local time to UTC
    const utcTime = DateTime.fromFormat(localTime, 'HH:mm', {
      zone: timeZone,
    }).toUTC();

    // Return UTC time in ISO format and hour
    return utcTime.toFormat('HH:mm');
  }
  async createAvailability(body: CreateAvailabilityDto, timezone?: string) {
    // body.session_price = 1;
    const timesBody = { ...body };
    const days = [
      'saturday',
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
    ];
    const availabilityExist = await this.availabilityModel.findOne({
      doctorId: body.doctorId,
      isDelete: false,
    });
    if (availabilityExist) {
      throw new NotFoundException('Doctor have an availability');
    }
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      if (body[day] && body[day].length > 0) {
        body[day] = this.formatAndSortTimeArray(body[day]).map((value) => {
          return this.getUtcTime(value, timezone);
        });
      }
    }
    const availability = await this.availabilityModel.create(body);
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      if (timesBody[day]) {
        this.eventEmitter.emit('add:slots', {
          weekday: day,
          workingHours: timesBody[day],
          doctorId: body.doctorId,
          timezone,
        });
      }
    }
    return availability;
  }
  async updateAvailability(
    doctorId: string,
    body: UpdateAvailability,
    timezone?: string,
  ) {
    const timesBody = { ...body };
    const days = [
      'saturday',
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
    ];
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      if (body[day]) {
        const resultDates = this.slotService.getDatesArray(day);
        for (let j = 0; j < resultDates.length; j++) {
          const { startOfDayUTC, endOfDayUTC } = this.slotService.getLocalTime(
            resultDates[i].day,
            resultDates[i].month,
            resultDates[i].year,
            timezone,
          );
          const appointment = await this.appointMentModel.find({
            appointmentDate: {
              $gt: startOfDayUTC,
              $lt: endOfDayUTC,
            },
            status: {
              $ne: 'cancelled',
            },
            doctorId,
          });
          if (appointment && appointment.length > 0) {
            throw new NotFoundException(
              `can not change appointments of ${appointment[0]._id} please cancel it`,
            );
          }
        }
      }
    }
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
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      if (timesBody[day]) {
        this.eventEmitter.emit('add:slots', {
          weekday: day,
          workingHours: timesBody[day],
          doctorId: body.doctorId,
          timezone,
        });
      }
    }
    return updatedAvaialability;
  }
  async getAvailability(doctorId: string, timezone: string) {
    const availability = await this.availabilityModel.findOne({
      doctorId,
      isDelete: false,
    });
    console.log('availability', availability);
    if (!availability) {
      throw new NotFoundException('Doctor dont have aviablity');
    }
    const days = [
      'saturday',
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
    ];
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      availability[day] = availability[day].map((value) => {
        return this.getLocalTimeFromUtc(value, timezone);
      });
    }
    return availability;
  }
  async deleteAvailability(docId){
    const av = await this.availabilityModel.findOne({doctorId:docId});
    if(!av){
      throw new NotFoundException('availability not found')
    }
    await this.availabilityModel.findByIdAndDelete(av._id);
    return 'availability deleted'
  }
}
