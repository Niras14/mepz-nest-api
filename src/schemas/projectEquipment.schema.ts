import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Transform, Type } from 'class-transformer';
import { EquipmentLabelSchema, EquipmentLabel } from './equipmentLabel.schema';
import {
  EquipmentPackageSchema,
  EquipmentPackage,
} from './equipmentPackage.schema';
import { EquipmentPowerSchema, EquipmentPower } from './equipmentPower.schema';

export type ProjectEquipmentDocument = ProjectEquipment & Document;

@Schema({
  timestamps: true,
})
export class ProjectEquipment {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop()
  equipmentId: string;

  @Prop()
  projectId: string;
  @Prop()
  projectCode: string;
  @Prop()
  projectName: string;

  @Prop()
  departmentId: string;
  @Prop()
  departmentCode: string;
  @Prop()
  departmentName: string;
  
  @Prop()
  departmentActive: boolean;
  

  @Prop()
  roomId: string;

  @Prop()
  roomNo: string;

  @Prop()
  roomCode: string;
  @Prop()
  roomName: string;
  @Prop()
  roomActive: boolean;

  @Prop()
  equipmentId4: string;

  @Prop()
  qty: number;

  @Prop()
  name: string;

  // @Prop()
  // alias: string;

  @Prop()
  code: string;

  @Prop()
  apq: number;

  @Prop()
  fpq: number;

  @Prop()
  cost: string;

  @Prop()
  active: boolean;

  @Prop()
  markUp: string;

  @Prop()
  heatDissipation: string;

  @Prop()
  ictPort: string;

  @Prop()
  bssPort: string;

  @Prop()
  utility: string;

  //@Prop({ required: true })
  @Prop()
  floor: string;

  @Prop()
  group: string;

  @Prop()
  eq_group: string;

  @Prop()
  specs: string;

  @Prop(raw({}))
  brands: Record<string, any>;

  @Prop(raw({}))
  labels: Record<string, any>;

  @Prop()
  markupPer: string; // TODO: verify the field

  @Prop(raw({}))
  package: Record<string, any>;

  @Prop({ type: EquipmentPackageSchema })
  @Type(() => EquipmentPackage)
  equipmentPackage: EquipmentPackage;

  @Prop({ type: EquipmentPowerSchema })
  @Type(() => EquipmentPower)
  equipmentPowerRequirement: EquipmentPower;

  @Prop({ type: EquipmentLabelSchema })
  @Type(() => EquipmentLabel)
  equipmentLabel: EquipmentLabel;

  // @Prop({ required: true })
  // isDeleted: boolean;
}

export const ProjectEquipmentSchema =
  SchemaFactory.createForClass(ProjectEquipment);