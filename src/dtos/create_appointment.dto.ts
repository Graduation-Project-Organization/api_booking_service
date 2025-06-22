import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsDateString()
  appointmentDateTime: string;

  @IsDateString()
  appointmentFormattedDate: string;

  @IsString()
  appointmentTime: string;

  @IsNumber()
  @IsOptional()
  charge: number;

  // Doctor details
  @IsString()
  doctorId: string;

  @IsString()
  @IsOptional()
  patientId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  email: string;

  @IsDateString()
  dob: Date;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsOptional()
  appointment_reason: string;

  @IsString()
  @IsOptional()
  start_url: string;

  @IsString()
  @IsOptional()
  join_url: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  medical_documents?: string[];

  status?: string = 'pending';
}
