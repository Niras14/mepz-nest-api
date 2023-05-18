import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DepartmentEq, DepartmentEqSchema } from './departmentEq.schema';
import { Type } from 'class-transformer';

import { RoomsEqSchema, RoomsEq } from './roomsEq.schema';
import { EquipmentsEq, EquipmentsEqSchema } from './equipmentsEq.schema';

export type ProjectDocument = Project & Document;

@Schema({
  timestamps: { createdAt: 'created', updatedAt: 'updated' },
})
export class Project {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  projectname: string;

  @Prop({ required: true })
  fullProjectName: string;

  @Prop({ required: true })
  clientOwner: string;

  @Prop({ required: true })
  contractNo: string;

  @Prop({ required: true })
  noofBeds: string;

  @Prop({ required: true })
  classification: string;

  @Prop({ required: true })
  projecttype: string;

  @Prop({ required: true })
  company: string;

  @Prop({ required: true })
  signature1: string;

  @Prop({ required: true })
  signature2: string;

  @Prop({ type: [DepartmentEqSchema] })
  @Type(() => DepartmentEq)
  departmentEq: DepartmentEq[];

  @Prop({ type: [EquipmentsEqSchema] })
  @Type(() => EquipmentsEq)
  equipmentsEq: EquipmentsEq[];

  @Prop({ type: [RoomsEqSchema] })
  @Type(() => RoomsEq)
  roomsEq: RoomsEq[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
