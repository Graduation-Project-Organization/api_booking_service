import { InjectModel } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { Model } from 'mongoose';
import { Working } from '../models/slot.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { Appointment } from '../models/appointment';
import { Injectable, NotFoundException } from '@nestjs/common';

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
    const todayDayOfWeek = today.getUTCDay();
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
      nextDate.setUTCDate(today.getUTCDate() + daysToAdd + i * 7);

      resultDates.push({
        day: nextDate.getUTCDate(),
        year: nextDate.getUTCFullYear(),
        month: nextDate.getUTCMonth() + 1,
      });
    }
    console.log('dates day month year', resultDates);
    return resultDates;
  }

  async getNextFourWeeksDatesForDay(
    weekday: string,
    doctorProfileId: string,
    workingHours: string[],
    interval: number,
    timezone: string,
  ) {
    const resultDates = this.getDatesArray(weekday);
    for (const { day, year, month } of resultDates) {
      await this.createSlot(
        { day, year, month, workingHours, interval, doctorProfileId },
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

  @OnEvent('add:slots')
  async addSlots({
    weekday,
    workingHours,
    doctorProfileId,
    timezone,
    interval,
  }) {
    await this.getNextFourWeeksDatesForDay(
      weekday,
      doctorProfileId,
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
    doctorProfileId: string,
    interval: number,
    timezone: string,
  ) {
    workingHours = this.convertToUtc(day, month, year, workingHours, timezone);
    console.log(workingHours);
    for (let i = 0; i < workingHours.length; i += 1) {
      const fromTime = new Date(workingHours[i]);
      const toTime = new Date(
        new Date(workingHours[i]).getTime() + interval * 60 * 1000,
      );
      const appointment = await this.appointmentModel.findOne({
        doctorProfileId,
        status: { $in: ['pending', 'confirmed'] },
        appointmentDateTime: { $lt: toTime },
        appointmentEndTime: { $gt: fromTime },
      });

      console.log('appintment name', appointment);

      //   start < to && end > from
      if (appointment) {
        continue; // Skip creating slots for existing appointments
      }
      const slot = await this.workingModel.create({
        from: workingHours[i],
        doctorProfileId,
      });

      console.log('slot is ', slot);

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
    const dayIndex = date.getUTCDay();
    return daysOfWeek[dayIndex];
  }
  async createSlot(
    body: {
      day: number;
      year: number;
      month: number;
      workingHours: string[];
      interval: number;
      doctorProfileId: string;
    },
    timezone: string,
  ) {
    const { startOfDayUTC, endOfDayUTC } = this.getLocalTime(
      body.day,
      body.month,
      body.year,
      timezone,
    );

    console.log('dpctor id is', body.doctorProfileId);

    await this.workingModel.deleteMany({
      doctorProfileId: body.doctorProfileId,
      from: { $gte: startOfDayUTC, $lte: endOfDayUTC },
    });

    await this.createWorkingHoursCalender(
      body.workingHours,
      body.day,
      body.month,
      body.year,
      body.doctorProfileId,
      body.interval,
      timezone,
    );
  }

  async getAllAvailableSlots(
    doctorProfileId: string,
    { day, month, year }: { day: number; month: number; year: number },
    timezone: string,
  ) {
    console.log(doctorProfileId);
    const { startOfDayUTC, endOfDayUTC } = this.getLocalTime(
      day,
      month,
      year,
      timezone,
    );

    const slots = await this.workingModel
      .find({
        from: {
          $gte: startOfDayUTC,
          $lte: endOfDayUTC,
        },
        doctorProfileId,
      })
      .select('from');

    const data = slots.map((ele) => {
      const time = DateTime.fromISO(ele.from.toISOString(), {
        zone: 'utc',
      }).setZone(timezone);
      return time;
    });

    return { data };
  }
  private getLocalTimeFromUtc(utcDateTime: string, timeZone: string): string {
    const localTime = DateTime.fromISO(utcDateTime, { zone: 'utc' }).setZone(
      timeZone,
    );
    return localTime.toFormat('dd-MM-yyyy HH:mm');
  }
  async validateAppointmentExist(
    weekday: string,
    doctorProfileId: string,
    workingHours: string[],
    interval: number,
    timezone: string,
  ) {
    const resultDates = this.getDatesArray(weekday); // returns next few matching days (e.g., next 4 Tuesdays)

    for (const { day, year, month } of resultDates) {
      const { startOfDayUTC, endOfDayUTC } = this.getLocalTime(
        day,
        month,
        year,
        timezone,
      );

      const appointments = await this.appointmentModel.find({
        doctorProfileId,
        status: { $in: ['pending', 'confirmed'] },
        appointmentDateTime: {
          $gte: new Date(startOfDayUTC),
          $lte: new Date(endOfDayUTC),
        },
      });

      // 2. Convert workingHours to UTC time slots
      const utcWorkingTimes: { from: Date; to: Date }[] = [];
      const convertedWorkingHours = this.convertToUtc(
        day,
        month,
        year,
        workingHours,
        timezone,
      );

      for (let i = 0; i < convertedWorkingHours.length; i++) {
        const from = new Date(convertedWorkingHours[i]);
        const to = new Date(from.getTime() + interval * 60 * 1000);
        utcWorkingTimes.push({ from, to });
      }

      // 3. Check for mismatched appointments
      for (const appointment of appointments) {
        appointment.appointmentDateTime = new Date(
          appointment.appointmentDateTime,
        );
        const exists = utcWorkingTimes.some(({ from, to }) => {
          return (
            appointment.appointmentDateTime.getTime() === from.getTime() &&
            appointment.appointmentEndTime.getTime() === to.getTime()
          );
        });

        if (!exists) {
          const from = this.getLocalTimeFromUtc(
            appointment.appointmentDateTime.toISOString(),
            timezone,
          );
          const to = this.getLocalTimeFromUtc(
            appointment.appointmentEndTime.toISOString(),
            timezone,
          );
          throw new NotFoundException(
            `Appointment from ${from} to ${to} is not in the defined working hours.`,
          );
        }
      }
    }
  }
}
