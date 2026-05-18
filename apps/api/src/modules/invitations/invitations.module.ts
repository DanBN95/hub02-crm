import { Module } from '@nestjs/common';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { InvitationsController } from './invitations.controller';
import { InvitationsRepository } from './invitations.repository';
import { InvitationsService } from './invitations.service';

@Module({
  imports: [WorkspacesModule],
  controllers: [InvitationsController],
  providers: [InvitationsService, InvitationsRepository],
})
export class InvitationsModule {}
