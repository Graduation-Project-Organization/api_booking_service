import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Working extends Document {
  @Prop({ type: Date })
  from: Date;

  @Prop({ type: String })
  doctorId: string;
}

export const WorkingSchema = SchemaFactory.createForClass(Working);
