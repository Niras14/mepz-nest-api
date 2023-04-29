// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/swagger';
import { CreateEquipmentAllocationDto } from './create-equipment-allocation.dto';

export class UpdateEquipmentAllocationDto extends PartialType(
  CreateEquipmentAllocationDto,
) {}
