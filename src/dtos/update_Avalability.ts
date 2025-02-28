import { PartialType } from '@nestjs/mapped-types';
import { CreateAvailabilityDto } from './create_Availability.dto';

export class UpdateAvailability extends PartialType(CreateAvailabilityDto) {}
