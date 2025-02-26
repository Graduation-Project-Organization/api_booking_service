import { IsString, IsNotEmpty, IsDate, IsEmail, IsArray, IsNumber, IsEnum, IsOptional } from "class-validator";

export class CreateAppointmentDto {
    @IsDate()
    appointmentDate: Date;

    @IsString()
    @IsNotEmpty()
    appointmentFormattedDate: string;

    @IsString()
    @IsNotEmpty()
    appointmentTime: string;

    @IsNumber()
    charge: number;

    @IsString()
    @IsNotEmpty()
    doctorId: string;

    // Patient Details
    @IsString()
    @IsNotEmpty()
    patientId: string;

    @IsString()
    first_name: string;

    @IsString()
    last_name: string;

    @IsEmail()
    mail: string;

    @IsDate()
    dob: Date;

    @IsString()
    location: string;

    @IsString()
    appointment_reason: string;

    @IsArray()
    @IsOptional()
    medical_documents?: string[];

    @IsString()
    occupation: string;

    @IsEnum(["pending", "confirmed", "completed", "cancelled"])
    status: string;

    // Meeting
    @IsOptional()
    @IsString()
    meeting_link?: string;

    @IsEnum(["Zoom", "Google Meet", "Microsoft Teams"])
    meeting_provider: string;
}
