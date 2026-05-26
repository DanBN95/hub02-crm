import { Module } from '@nestjs/common';
import { WorkspaceRoleGuard } from '../auth/guards/workspace-role.guard';
import { TasksController } from './tasks.controller';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';

@Module({
  controllers: [TasksController],
  providers: [TasksService, TasksRepository, WorkspaceRoleGuard],
})
export class TasksModule {}
