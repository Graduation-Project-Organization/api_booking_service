import {
  // BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  async updateAvailability(
    doctorProfileId: string,
    docId: string,
    body: UpdateAvailability,
    timezone?: string,
  ) {
    body.doctorProfileId = doctorProfileId;
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
      doctorProfileId,
      // isDelete: false,
    });
    if (!availability) {
      availability = await this.availabilityModel.create({
        doctorProfileId,
        // docId,
      });
    }
    console.log(availability);
    // if (availability.docId !== docId) {
    //   throw new BadRequestException(
    //     'you are not authorized to update this availability',
    //   );
    // }
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      if (timesBody[day] && timesBody[day]?.length >= 0) {
        await this.slotService.validateAppointmentExist(
          day,
          doctorProfileId,
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
          doctorProfileId: doctorProfileId,
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
  async getAvailability(doctorProfileId: string, timezone: string) {
    const availability = await this.availabilityModel.findOne({
      doctorProfileId,
    });

    if (!availability) {
      throw new NotFoundException('availability not found');
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
}
