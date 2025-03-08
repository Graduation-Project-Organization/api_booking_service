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
  appointmentDateTime: Date;

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
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  mail: string;

  @IsDateString()
  dob: Date;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsOptional()
  appointment_reason: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  medical_documents?: string[];

  status?: string = 'pending';
}
