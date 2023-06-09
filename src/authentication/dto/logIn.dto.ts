import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LogInDto {

  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  password: string;
}

// export default LogInDto;
