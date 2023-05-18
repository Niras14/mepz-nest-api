import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Transform } from 'class-transformer';

export type EquipmentsEqDocument = EquipmentsEq & Document;

@Schema()
export class EquipmentsEq {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop()
  name: string;

}

export const EquipmentsEqSchema = SchemaFactory.createForClass(EquipmentsEq);
