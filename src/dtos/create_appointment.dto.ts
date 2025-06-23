import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
  IsDateString,
} from 'class-validator';

export class CreateAppointmentDto {
  // Appointment detail
  @IsString()
  appointmentDateTime: string;

  @IsString()
  @IsOptional()
  appointmentDate: string;

  appointmentEndTime?: string;

  @IsString()
  @IsOptional()
  appointmentFormattedDate: string;

  @IsString()
  @IsOptional()
  day?: string;

  @IsString()
  @IsOptional()
  appointmentTime: string;

  charge?: number;

  // Doctor details
  @IsString()
  doctorId: string;

  doctorProfileId?: string;

  @IsString()
  @IsOptional()
  doctorName?: string;

  patientId?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsDateString()
  @IsOptional()
  dob?: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsOptional()
  appointmentReason?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  medicalDocuments?: string[];

  @IsString()
  @IsOptional()
  occupation?: string;

  status?: string = 'pending';

  // Meeting details
  @IsString()
  @IsOptional()
  meetingLink?: string;

  @IsString()
  @IsOptional()
  startUrl?: string;

  @IsString()
  @IsOptional()
  joinUrl?: string;

  @IsEnum(['Google Meet', 'Zoom', 'Microsoft Teams'])
  @IsOptional()
  meetingProvider?: string;
}
