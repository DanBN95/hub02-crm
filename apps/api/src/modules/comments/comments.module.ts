import { Module } from '@nestjs/common';
import { WorkspaceRoleGuard } from '../auth/guards/workspace-role.guard';
import { CommentsController } from './comments.controller';
import { CommentsRepository } from './comments.repository';
import { CommentsService } from './comments.service';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepository, WorkspaceRoleGuard],
})
export class CommentsModule {}
