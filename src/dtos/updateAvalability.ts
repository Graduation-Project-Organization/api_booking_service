import { PartialType } from "@nestjs/mapped-types";
import { CreateAvailabilityDto } from "./createAvailability.dto";

export class UpdateAvailability  extends PartialType(CreateAvailabilityDto) {} 