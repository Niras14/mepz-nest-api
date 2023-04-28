// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/swagger';
import { CreateRoomsDto } from './create-rooms.dto';

export class UpdateRoomsDto extends PartialType(CreateRoomsDto) {}
