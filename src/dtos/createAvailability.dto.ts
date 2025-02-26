import { IsString, IsArray, IsOptional, isNotEmpty, IsNotEmpty } from "class-validator";

export class CreateAvailabilityDto {
    @IsString()
    @IsNotEmpty()
    doctorId: string;

    @IsString()
    @IsOptional()
    profileId?: string;
    @IsArray()
    @IsOptional()
    monday?: string[];

    @IsArray()
    @IsOptional()
    tuesday?: string[];

    @IsArray()
    @IsOptional()
    wednesday?: string[];

    @IsArray()
    @IsOptional()
    thursday?: string[];

    @IsArray()
    @IsOptional()
    friday?: string[];

    @IsArray()
    @IsOptional()
    saturday?: string[];

    @IsArray()
    @IsOptional()
    sunday?: string[];

    @IsString()
    @IsOptional()
    interval?: string;
}
