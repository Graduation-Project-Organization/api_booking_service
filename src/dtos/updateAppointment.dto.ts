import { PartialType } from "@nestjs/mapped-types";
import { CreateAppointmentDto } from "./CreateAppointment.dto";

export class UpdateAppointment extends PartialType(CreateAppointmentDto) {} 