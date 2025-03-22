import { InjectModel } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { Model } from 'mongoose';
import { Working } from '../models/slot.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { Appointment } from 'src/models/appointment';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SlotService {
  constructor(
    @InjectModel(Working.name) private workingModel: Model<Working>,
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
  ) {}

  convertToUtc(
    day: number,
    month: number,
    year: number,
    times: string[],
    timeZone: string,
  ): string[] {
    console.log('date is =>', day, month, year);
    console.log('times is =>', times);
    console.log('time zone is', timeZone);

    const result = times.map((time) => {
      const localDateTime = DateTime.fromObject(
        {
          year: year,
          month: month,
          day: day,
          hour: parseInt(time.split(':')[0], 10),
          minute: parseInt(time.split(':')[1], 10),
        },
        { zone: timeZone },
      );
      // Convert to UTC
      return localDateTime.toUTC().toISO();
    });

    console.log('slot result =>', result);

    return result;
  }

  getDatesArray(weekday: string) {
    const today = new Date();
    const todayDayOfWeek = today.getDay();
    const daysOfWeek = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const targetDayOfWeek = daysOfWeek.indexOf(weekday);
    let daysToAdd = targetDayOfWeek - todayDayOfWeek;
    if (daysToAdd < 0) {
      daysToAdd += 7;
    }
    const resultDates: { day: number; month: number; year: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const nextDate = new Date();
      nextDate.setUTCHours(0, 0, 0, 0);
      nextDate.setDate(today.getDate() + daysToAdd + i * 7);

      resultDates.push({
        day: nextDate.getUTCDate(),
        year: nextDate.getUTCFullYear(),
        month: nextDate.getUTCMonth() + 1,
      });
    }
    return resultDates;
  }

  async getNextFourWeeksDatesForDay(
    weekday: string,
    doctorId: string,
    workingHours: string[],
    interval: number,
    timezone: string,
  ) {
    const resultDates = this.getDatesArray(weekday);
    for (const { day, year, month } of resultDates) {
      await this.createSlot(
        { day, year, month, workingHours, doctorId, interval },
        timezone,
      );
      console.log('this is day an d', day, year, month);
    }
  }

  getLocalHour(utcTime: string, timezone: string): string {
    // Convert UTC time to local time
    const localTime = DateTime.fromISO(utcTime, { zone: 'utc' }).setZone(
      timezone,
    );
    // Return the hour in HH:mm format
    return localTime.toFormat('HH:mm');
  }
  //   this.eventEmitter.emit('add:slots', {
  //     weekday: day,
  //     workingHours: availability[day],
  //     doctorId: body.doctorId,
  //     timezone,
  //   });

  @OnEvent('add:slots')
  async addSlots({ weekday, workingHours, doctorId, timezone, interval }) {
    await this.getNextFourWeeksDatesForDay(
      weekday,
      doctorId,
      workingHours,
      interval,
      timezone,
    );
  }

  getLocalTime(day: number, month: number, year: number, timezone: string) {
    // Create the date in the specified timezone
    console.log('day month year logs', day, month, year);
    const startOfDayLocal = DateTime.fromObject(
      { year, month, day, hour: 0, minute: 0, second: 0 },
      { zone: timezone },
    );

    const endOfDayLocal = startOfDayLocal.set({
      hour: 23,
      minute: 59,
      second: 59,
    });

    // Convert to UTC in ISO format (best for databases)
    const startOfDayUTC = startOfDayLocal.toUTC().toISO(); // "2025-03-06T00:00:00.000Z"
    const endOfDayUTC = endOfDayLocal.toUTC().toISO(); // "2025-03-06T23:59:59.999Z"

    console.log(startOfDayUTC, endOfDayUTC);
    return { startOfDayUTC, endOfDayUTC };
  }

  async createWorkingHoursCalender(
    workingHours: string[],
    day: number,
    month: number,
    year: number,
    doctorId: string,
    interval: number,
    timezone: string,
  ) {
    workingHours = this.convertToUtc(day, month, year, workingHours, timezone);
    console.log(workingHours);
    for (let i = 0; i < workingHours.length; i += 1) {
      const fromTime = new Date(workingHours[i]);
      const toTime = new Date(
        new Date(workingHours[i + 1]).getTime() + interval * 60 * 1000,
      );
      const appointment = await this.appointmentModel.findOne({
        doctorId,
        status: { $in: ['pending', 'confirmed'] },
        $or: [
          {
            appointmentDateTime: { $lt: toTime }, // Starts before the new appointment ends
            appointmentEndTime: { $gt: fromTime }, // Ends after the new appointment starts
          },
        ],
      });
      console.log(appointment);
      if (appointment) {
        continue; // Skip creating slots for existing appointments
      }
      const slot = await this.workingModel.create({
        from: workingHours[i],
        doctorId,
      });

      console.log('slots created', slot);
    }
  }
  getDayFromDate(year: number, month: number, day: number) {
    const date = new Date(year, month - 1, day);
    date.setUTCHours(0, 0, 0, 0);
    const daysOfWeek = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const dayIndex = date.getDay();
    return daysOfWeek[dayIndex];
  }
  async createSlot(
    body: {
      day: number;
      year: number;
      month: number;
      workingHours: string[];
      doctorId: string;
      interval: number;
    },
    timezone: string,
  ) {
    const { startOfDayUTC, endOfDayUTC } = this.getLocalTime(
      body.day,
      body.month,
      body.year,
      timezone,
    );

    console.log('dpctor id is', body.doctorId);

    await this.workingModel.deleteMany({
      from: { $gte: startOfDayUTC, $lte: endOfDayUTC },
    });

    await this.createWorkingHoursCalender(
      body.workingHours,
      body.day,
      body.month,
      body.year,
      body.doctorId,
      body.interval,
      timezone,
    );
  }

  async getAllAvailableSlots(
    doctorId: string,
    { day, month, year }: { day: number; month: number; year: number },
    timezone: string,
  ) {
    console.log(doctorId);
    const { startOfDayUTC, endOfDayUTC } = this.getLocalTime(
      day,
      month,
      year,
      timezone,
    );

    const slots = await this.workingModel.find({
      from: {
        $gte: startOfDayUTC,
        $lte: endOfDayUTC,
      },
      doctorId,
    });

    return slots;
  }

  async getFirstSlotAvailable(doctorId: string) {
    const slot = await this.workingModel
      .findOne({
        from: {
          $gte: new Date(),
        },
        doctorId,
      })
      .sort('from');
    return slot;
  }
}
