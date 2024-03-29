import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Transform, Type } from 'class-transformer';
import {
  ProjectRoomEquipment,
  ProjectRoomEquipmentSchema,
} from './projectRoomEquipment.schema';

export type ProjectDepartmentRoomDocument = ProjectDepartmentRoom & Document;

@Schema({
  timestamps: true,
})
export class ProjectDepartmentRoom {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop()
  mysqlRoomId: number;

  @Prop()
  name: string;

  @Prop()
  roomId: string;

  @Prop()
  alias: string;

  @Prop()
  code: string;

  @Prop()
  size: number;

  @Prop()
  active: boolean;

  @Prop()
  isDeleted: boolean;

  @Prop({ type: [ProjectRoomEquipmentSchema] })
  @Type(() => ProjectRoomEquipment)
  equipments: ProjectRoomEquipment[];
}

export const ProjectDepartmentRoomSchema = SchemaFactory.createForClass(
  ProjectDepartmentRoom,
);
