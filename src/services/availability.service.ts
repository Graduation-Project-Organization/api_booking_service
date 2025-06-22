import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Availability, AvailabilityDocument } from '../models/availability';
// import { CreateAvailabilityDto } from '../dtos/create_Availability.dto';
import { UpdateAvailability } from '../dtos/update_Avalability';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DateTime } from 'luxon';
import { SlotService } from './slot.service';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(Availability.name)
    private availabilityModel: Model<AvailabilityDocument>,
    private eventEmitter: EventEmitter2,
    private slotService: SlotService,
  ) {}
  private getLocalTimeFromUtc(utcTime: string, timeZone: string): string {
    // Convert UTC time to the given time zone
    const localTime = DateTime.fromFormat(utcTime, 'HH:mm', {
      zone: 'utc',
    }).setZone(timeZone);
    // Return local time in HH:mm format
    return localTime.toFormat('HH:mm');
  }
  private formatAndSortTimeArray(times: string[]): string[] {
    return times
      .map((time) => {
        const [hour, minute] = time.split(':');
        return { hour: Number(hour), minute: Number(minute) };
      })
      .sort((a, b) => a.hour - b.hour || a.minute - b.minute) // Sort by hour first, then by minute
      .map(({ hour, minute }) => {
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      });
  }
  private getUtcTime(localTime: string, timeZone: string): string {
    // Convert local time to UTC
    const utcTime = DateTime.fromFormat(localTime, 'HH:mm', {
      zone: timeZone,
    }).toUTC();

    // Return UTC time in ISO format and hour
    return utcTime.toFormat('HH:mm');
  }
  // async createAvailability(body: CreateAvailabilityDto, timezone?: string) {
  //   // body.session_price = 1;
  //   const timesBody = { ...body };
  //   const days = [
  //     'saturday',
  //     'sunday',
  //     'monday',
  //     'tuesday',
  //     'wednesday',
  //     'thursday',
  //     'friday',
  //   ];
  //   const availabilityExist = await this.availabilityModel.findOne({
  //     doctorId: body.doctorId,
  //     isDelete: false,
  //   });
  //   if (availabilityExist) {
  //     throw new NotFoundException('Doctor have an availability');
  //   }
  //   for (let i = 0; i < days.length; i++) {
  //     const day = days[i];
  //     if (body[day] && body[day].length > 0) {
  //       body[day] = this.formatAndSortTimeArray(body[day]).map((value) => {
  //         return this.getUtcTime(value, timezone);
  //       });
  //     }
  //   }
  //   const availability = await this.availabilityModel.create(body);
  //   for (let i = 0; i < days.length; i++) {
  //     const day = days[i];
  //     if (timesBody[day] && timesBody[day]?.length > 0) {
  //       this.eventEmitter.emit('add:slots', {
  //         weekday: day,
  //         workingHours: timesBody[day],
  //         doctorId: body.doctorId,
  //         timezone,
  //         interval: availability.interval,
  //       });
  //     }
  //   }
  //   return availability;
  // }
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
    let availability = await this.availabilityModel.findOne({
      doctorId,
      isDelete: false,
    });
    if (!availability) {
      availability = await this.availabilityModel.create({
        doctorId,
      });
    }
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      if (timesBody[day] && timesBody[day]?.length >= 0) {
        await this.slotService.validateAppointmentExist(
          day,
          doctorId,
          timesBody[day],
          availability.interval,
          timezone,
        );
      }
    }
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      if (body[day] && body[day].length > 0) {
        body[day] = this.formatAndSortTimeArray(body[day]).map((value) => {
          return this.getUtcTime(value, timezone);
        });
      }
    }
    // original body is fromatted with utc time
    const updatedAvaialability = await this.availabilityModel.findByIdAndUpdate(
      availability._id,
      body,
      {
        new: true,
      },
    );
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      if (timesBody[day] && timesBody[day]?.length >= 0) {
        this.eventEmitter.emit('add:slots', {
          weekday: day,
          workingHours: timesBody[day],
          doctorId: doctorId,
          timezone,
          interval: updatedAvaialability.interval,
        });
      }
    }
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      updatedAvaialability[day] = updatedAvaialability[day].map((value) => {
        return this.getLocalTimeFromUtc(value, timezone);
      });
    }
    return updatedAvaialability;
  }
  async getAvailability(doctorId: string, timezone: string) {
    let availability = await this.availabilityModel.findOne({
      doctorId,
      isDelete: false,
    });
    console.log('availability', availability);
    if (!availability) {
      availability = await this.availabilityModel.create({
        doctorId,
      });
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
  // async deleteAvailability(docId) {
  //   const av = await this.availabilityModel.findOne({ doctorId: docId });
  //   if (!av) {
  //     throw new NotFoundException('availability not found');
  //   }
  //   await this.availabilityModel.findByIdAndDelete(av._id);
  //   return 'availability deleted';
  // }
}
