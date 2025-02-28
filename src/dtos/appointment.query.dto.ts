import { IsOptional } from 'class-validator';

export class AppointmentQueryDto {
  @IsOptional()
  page: string;
  @IsOptional()
  limit: string;
  @IsOptional()
  keyword: string;
  doctorId: string;
  patientId: string;
}
