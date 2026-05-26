import { Module } from '@nestjs/common';
import { WorkspaceRoleGuard } from '../auth/guards/workspace-role.guard';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesRepository } from './workspaces.repository';
import { WorkspacesService } from './workspaces.service';

@Module({
  controllers: [WorkspacesController],
  providers: [WorkspacesService, WorkspacesRepository, WorkspaceRoleGuard],
  exports: [WorkspacesRepository, WorkspacesService],
})
export class WorkspacesModule {}
