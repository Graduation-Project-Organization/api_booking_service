import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Availability {
  @Prop({})
  doctorId: string;

  @Prop({})
  profileId: string;

  @Prop({ type: [String], default: [] })
  monday: string[];

  @Prop({ type: [String], default: [] })
  tuesday: string[];

  @Prop({ type: [String], default: [] })
  wednesday: string[];

  @Prop({ type: [String], default: [] })
  thursday: string[];

  @Prop({ type: [String], default: [] })
  friday: string[];

  @Prop({ type: [String], default: [] })
  saturday: string[];

  @Prop({ type: [String], default: [] })
  sunday: string[]; // example ["7:00","18:00", "19:00","20:00"]

  @Prop({ default: 60 })
  interval: number; // default number on minutes

  @Prop({ default: 2 })
  session_price: number;

  @Prop({ type: Boolean, default: false })
  isDelete: boolean;
}

export type AvailabilityDocument = HydratedDocument<Availability>;
export const AvailabilitySchema = SchemaFactory.createForClass(Availability);
