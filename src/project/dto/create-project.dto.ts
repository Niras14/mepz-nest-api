import { ApiProperty } from '@nestjs/swagger';
import { DepartmentEq } from '../../schemas/departmentEq.schema';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  @IsString()
  @IsNotEmpty()
  // @MinLength(20)
  code: string;

  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  @IsString()
  @IsNotEmpty()
  // @MinLength(20)
  projectname: string;

  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  @IsString()
  @IsNotEmpty()
  // @MinLength(20)
  fullProjectName: string;

  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  @IsString()
  @IsNotEmpty()
  // @MinLength(20)
  clientOwner: string;

  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  @IsString()
  @IsNotEmpty()
  // @MinLength(20)
  contractNo: string;

  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  @IsString()
  @IsNotEmpty()
  // @MinLength(20)
  noofBeds: string;

  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  @IsString()
  @IsNotEmpty()
  // @MinLength(20)
  classification: string;

  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  @IsString()
  @IsNotEmpty()
  // @MinLength(20)
  projecttype: string;

  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  @IsString()
  @IsNotEmpty()
  // @MinLength(20)
  company: string;

  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  @IsString()
  @IsNotEmpty()
  // @MinLength(20)
  signature1: string;

  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  @IsString()
  @IsNotEmpty()
  // @MinLength(20)
  signature2: string;

  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  // @IsString()
  departmentEq: { name: string; apq: number; fpq: number; qty: number }[];

  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  // @IsString()
  equipmentEq: { name: string; apq: number; fpq: number; qty: number }[];

  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  // @IsString()
  roomsEq: { name: string; apq: number; fpq: number; qty: number }[];

  // @ApiProperty({ type: String, description: 'This is a required property' })
  // DepartmentEq: {
  //   name: string;
  // }[];

  // @ApiProperty({ type: [String], description: 'This is a required property' })
  // roomsEq: {
  //   name: string;
  // }[];

  // @ApiProperty({ type: [String], description: 'This is a required property' })
  // equipmentEq: {
  //   name: string;
  // }[];

  // @ApiProperty({ type: Number, description: 'This is a required property' })
  // @IsNumber()
  // // @IsNotEmpty()
  // apq: number;

  // @ApiProperty({ type: Number, description: 'This is a required property' })
  // @IsNumber()
  // // @IsNotEmpty()
  // fpq: number;

  // @ApiProperty({ type: Number, description: 'This is a required property' })
  // @IsNumber()
  // // @IsNotEmpty()
  // qty: number;
}
