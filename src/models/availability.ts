import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Availability {
  @Prop({ required: true })
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
  sunday: string[];

  @Prop({ default: '30m' })
  interval: string;

  @Prop({ type: Boolean, default: false })
  isDelete: boolean;
}

export type AvailabilityDocument = HydratedDocument<Availability>;
export const AvailabilitySchema = SchemaFactory.createForClass(Availability);
