import { Module } from '@nestjs/common';
import { WorkspaceRoleGuard } from '../auth/guards/workspace-role.guard';
import { SprintsController } from './sprints.controller';
import { SprintsRepository } from './sprints.repository';
import { SprintsService } from './sprints.service';

@Module({
  controllers: [SprintsController],
  providers: [SprintsService, SprintsRepository, WorkspaceRoleGuard],
})
export class SprintsModule {}
