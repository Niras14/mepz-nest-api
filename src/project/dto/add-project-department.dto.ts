import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class AddProjectDepartmentDto {
  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  // @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  // @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  // @IsString()
  @IsNotEmpty()
  masterId: string;
}
