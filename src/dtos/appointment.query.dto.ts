import { IsOptional } from 'class-validator';

export class AppointmentQueryDto {
  @IsOptional()
  page: string;
  @IsOptional()
  limit: string;
  @IsOptional()
  keyword: string;
  @IsOptional()
  doctorId: string;
  @IsOptional()
  patientId: string;
}
export class DoctorAppointmentQueryDto {
  @IsOptional()
  page: string;
  @IsOptional()
  limit: string;
  @IsOptional()
  keyword: string;
  @IsOptional()
  doctorProfileId: string;
}
export class PatientAppointmentQueryDto {
  @IsOptional()
  page: string;
  @IsOptional()
  limit: string;
  @IsOptional()
  keyword: string;
  @IsOptional()
  patientId: string;
}
