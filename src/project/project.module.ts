import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from 'src/schemas/project.schema';
import { ActivityLogsModule } from 'src/administrator/activity-logs/activity-logs.module';
import {
  ProjectEquipment,
  ProjectEquipmentSchema,
} from 'src/schemas/projectEquipment.schema';

@Module({
  imports: [
    ActivityLogsModule,
    MongooseModule.forFeature([
      {
        name: Project.name,
        schema: ProjectSchema,
      },
      {
        name: ProjectEquipment.name,
        schema: ProjectEquipmentSchema,
      },
    ]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
