import {
  // IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  IsNumber,
  ArrayUnique,
  Min,
  IsString,
} from 'class-validator';

export class CreateAvailabilityDto {
  // @IsString()
  // @IsOptional()
  // doctorProfileId: string;

  @IsString()
  @IsOptional()
  docId: string;

  @IsArray()
  @ArrayUnique()
  @IsOptional()
  monday?: string[];

  @IsArray()
  @ArrayUnique()
  @IsOptional()
  tuesday?: string[];

  @IsArray()
  @ArrayUnique()
  @IsOptional()
  wednesday?: string[];

  @IsArray()
  @ArrayUnique()
  @IsOptional()
  thursday?: string[];

  @IsArray()
  @ArrayUnique()
  @IsOptional()
  friday?: string[];

  @IsArray()
  @ArrayUnique()
  @IsOptional()
  saturday?: string[];

  @IsArray()
  @ArrayUnique()
  @IsOptional()
  sunday?: string[];

  // @IsNumber()
  // @Min(1)
  // @IsOptional()
  // interval?: number = 30;

  @IsNumber()
  @Min(0)
  @IsOptional()
  session_price?: number;

  @IsBoolean()
  @IsOptional()
  isDelete?: boolean = false;
}
