import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  ProjectDepartment,
  ProjectDepartmentSchema,
} from './projectDepartment.schema';
import { Type } from 'class-transformer';

export type ProjectDocument = Project & Document;

@Schema({
  timestamps: true,
})
export class Project {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  fullName: string;

  @Prop()
  clientOwner: string;

  @Prop()
  contractNo: string;

  @Prop({ required: true })
  noOfBeds: string;

  @Prop({ required: true })
  classification: string;

  @Prop({ required: true })
  type: string;

  @Prop()
  company: string;

  @Prop()
  signature1: string;

  @Prop()
  signature2: string;

  @Prop()
  dateInitiatedProposal: string;

  @Prop()
  proposedFacilityCompletionDate: string;

  @Prop()
  address1: string;

  @Prop()
  address2: string;

  @Prop()
  city: string;

  @Prop()
  postalZip: string;

  @Prop()
  state: string;

  @Prop()
  country: string;

  @Prop({
    type: [
      {
        currencyCode: String,
        currencyDescription: String,
        currencySymbol: String,
      },
    ],
  })
  @Type(() => Object)
  currencies: {
    currencyCode: string;
    currencyDescription: string;
    currencySymbol: string;
  }[];

  @Prop({ required: true })
  isTemplate: boolean;

  @Prop({ type: [ProjectDepartmentSchema] })
  @Type(() => ProjectDepartment)
  departments: ProjectDepartment[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
