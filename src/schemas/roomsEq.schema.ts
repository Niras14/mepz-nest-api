import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Transform } from 'class-transformer';

export type RoomsEqDocument = RoomsEq & Document;

@Schema()
export class RoomsEq {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop()
  name: string;
}

export const RoomsEqSchema = SchemaFactory.createForClass(RoomsEq);
