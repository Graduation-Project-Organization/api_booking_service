import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ZoomService {
  // private readonly accountId = "FH6wT49lTZqqE85mg0rAaQ";
  // private readonly clientId = "YjudLnjTRPuaD4908yjiWYA";
  // private readonly clientSecret = "ZNeCwI21fuQpoVXf8X6qNG3WUVmH3Aeh";
  private accessToken: string | null = null;

  constructor() {}

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    const base64Auth = process.env.base64Auth; //Buffer.from(`${process.env.clientId}:${process.env.client_secret}`).toString("base64");
    console.log('base64Auth', base64Auth);
    try {
      const response = await axios.post(
        `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.accountId}`,
        {},
        {
          headers: {
            Authorization: `Basic ${base64Auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error(
        'Error fetching Zoom access token:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to generate Zoom access token');
    }
  }

  public async createMeeting(
    topic: string,
    duration: number = 30,
    start_time: string,
  ) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.post(
        'https://api.zoom.us/v2/users/me/meetings',
        {
          topic,
          type: 2, // Scheduled Meeting
          duration,
          timezone: 'UTC',
          start_time: start_time || new Date().toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error(
        'Error creating Zoom meeting:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to create Zoom meeting');
    }
  }
}
