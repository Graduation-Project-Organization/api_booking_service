import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { GoogleMeetingService } from 'src/services/google_meeting.service';

@Controller('google')
export class GoogleMeetingController {
  constructor(
    private readonly meetingSchedulerService: GoogleMeetingService,
    // private readonly emailService: EmailService,
  ) {}
  @Get('authorize')
  // @UseGuards(AuthenticationGuard, AuthorizationGuard)
  // @Roles(All_Role.User)
  authorize(@Res() res: Response) {
    return this.meetingSchedulerService.session(res);
  }
  @Get('redirect')
  redirect(@Query() query: { code: string }) {
    return this.meetingSchedulerService.authorize(query.code);
  }
}
