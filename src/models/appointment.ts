import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Appointment {
  // Appointment detail
  @Prop({ type: Date })
  appointmentDateTime: Date;

  @Prop({ type: Date })
  appointmentDate: Date;

  @Prop({ type: Date })
  appointmentEndTime: Date;

  @Prop({ type: String })
  appointmentFormattedDate: string;

  @Prop({ type: String })
  day: string;

  @Prop({ type: String })
  appointmentTime: string;

  @Prop({ type: Number })
  charge: number;

  @Prop()
  doctorProfileId: string;

  @Prop()
  doctorId: string;

  @Prop()
  doctorName: string;

  @Prop({ type: String })
  patientId: string;

  @Prop({ type: String })
  gender: string; // New field matching Prisma

  @Prop({ type: String })
  phone: string; // New field matching Prisma

  @Prop({ type: String })
  firstName: string;

  @Prop({ type: String })
  lastName: string;

  @Prop({ type: String })
  paymentUrl: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: Date })
  dob: Date;

  @Prop({ type: String })
  location: string;

  @Prop({ type: String })
  appointmentReason: string;

  @Prop({ type: [String], default: [] })
  medicalDocuments: string[];

  @Prop({ type: String })
  occupation: string;

  @Prop({
    type: String,
    default: 'pending',
  })
  status: string;

  // Meeting details
  @Prop({ type: String })
  meetingLink: string;

  @Prop({ type: String })
  startUrl: string;

  @Prop({ type: String })
  joinUrl: string;

  @Prop({
    type: String,
    enum: ['Google Meet', 'Zoom', 'Microsoft Teams'],
    default: 'Zoom',
  })
  meetingProvider: string;

  @Prop({ type: Boolean, default: false })
  isDelete: boolean;

  @Prop()
  orderId: string;

  @Prop()
  interval: number;

  @Prop()
  paidAt: Date;

  @Prop({ default: false })
  isPaid: boolean;
}

export type AppointmentDocument = HydratedDocument<Appointment>;
export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
