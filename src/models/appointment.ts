import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Appointment {
  // Appointment detail
  @Prop({ type: Date, required: true })
  appointmentDateTime: Date;

  @Prop({ type: Date })
  appointmentEndTime: Date;

  @Prop({ type: String, required: true })
  appointmentFormattedDate: string;

  @Prop({ type: String })
  day: string;

  @Prop({ type: String, required: true })
  appointmentTime: string;

  @Prop({ type: Number, required: true })
  charge: number;

  // Doctor details
  @Prop({ type: String, required: true })
  doctorId: string;

  // Patient details
  @Prop({ type: String, required: true })
  patientId: string;

  @Prop({ type: String, required: true })
  first_name: string;

  @Prop({ type: String, required: true })
  last_name: string;

  @Prop({ type: String, required: true })
  mail: string;

  @Prop({ type: Date, required: true })
  dob: Date;

  @Prop({ type: String, required: true })
  location: string;

  @Prop({ type: String, required: true })
  appointment_reason: string;

  @Prop({ type: [String], default: [] })
  medical_documents: string[];

  @Prop({ type: String })
  occupation: string;

  @Prop({
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  // Meeting details
  @Prop({ type: String })
  meeting_link: string;

  @Prop({ type: String })
  start_url: string;

  @Prop({ type: String })
  join_url: string;

  @Prop({
    type: String,
    enum: ['Google Meet', 'Zoom', 'Microsoft Teams'],
    default: 'Zoom',
  })
  meeting_provider: string;

  @Prop({ type: Boolean, default: false })
  isDelete: boolean;

  @Prop()
  orderId: string;

  @Prop()
  interval: number;
}

export type AppointmentDocument = HydratedDocument<Appointment>;
export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
