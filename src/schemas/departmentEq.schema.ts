import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Transform } from 'class-transformer';

export type DepartmentEqDocument = DepartmentEq & Document;

@Schema()
export class DepartmentEq {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop()
  name: string;
 
}

export const DepartmentEqSchema = SchemaFactory.createForClass(DepartmentEq);
