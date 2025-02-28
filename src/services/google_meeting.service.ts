import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { google } from 'googleapis';
import { v4 } from 'uuid';
import { SettingsService } from './setting.service';

@Injectable()
export class GoogleMeetingService {
  private oAuth2Client: any;
  constructor(
    private config: ConfigService,
    private settingsService: SettingsService,
  ) {
    this.oAuth2Client = new google.auth.OAuth2(
      this.config.get('Client_Id'),
      this.config.get('Client_Secret'),
      this.config.get('callback'),
    );
  }
  session(res: Response) {
    const url = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      prompt: 'consent',
    });
    res.redirect(url);
  }
  async authorize(code: string) {
    const { tokens } = await this.oAuth2Client.getToken(code);
    if (tokens.refresh_token) {
      this.oAuth2Client.setCredentials(tokens);
      await this.settingsService.setSetting(
        'refresh_token',
        tokens.refresh_token,
      );
      const oauth2 = google.oauth2({
        auth: this.oAuth2Client,
        version: 'v2',
      });
      // Retrieve user information
      const userInfo = await oauth2.userinfo.get();
      const email = userInfo.data.email;
      await this.settingsService.setSetting('refresh_email', email);
    }
    return {
      status: 'verified',
    };
  }
  async scheduleMeeting(
    name: string,
    description: string,
    startTime: Date,
    endTime: Date,
    attendeesEmails: string[],
    // user: IAuthUser,
  ) {
    const obj = await this.settingsService.getKeysValues([
      'refresh_email',
      'refresh_token',
    ]);
    this.oAuth2Client.setCredentials({ refresh_token: obj['refresh_token'] });
    attendeesEmails.push(obj['refresh_email']);
    const calendar = google.calendar({
      version: 'v3',
      auth: this.oAuth2Client,
    });

    const event = {
      summary: name,
      description: description,
      start: {
        dateTime: startTime, // Format: 'YYYY-MM-DDTHH:MM:SS'
        timeZone: 'UTC', // Adjust to your time zone
      },
      end: {
        dateTime: endTime,
        timeZone: 'UTC',
      },
      attendees: attendeesEmails.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: v4(), // Unique identifier
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    // @ts-ignore
    const meeting = await calendar.events.insert({
      calendarId: 'primary', // Use 'primary' for the user's default calendar
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all',
    });
    // @ts-ignore
    return meeting.data.hangoutLink;
  }
}
