import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvitationsService } from './invitations.service';

class CreateInviteDto {
  email!: string;
  role?: string;
}

@Controller()
export class InvitationsController {
  constructor(private readonly service: InvitationsService) {}

  /** POST /workspaces/:workspaceId/invitations */
  @Post('workspaces/:workspaceId/invitations')
  @UseGuards(JwtAuthGuard)
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateInviteDto,
  ) {
    return this.service.createInvite(workspaceId, dto.email, dto.role);
  }

  /** GET /workspaces/:workspaceId/invitations */
  @Get('workspaces/:workspaceId/invitations')
  @UseGuards(JwtAuthGuard)
  list(@Param('workspaceId') workspaceId: string) {
    return this.service.listPending(workspaceId);
  }

  /** POST /invitations/:token/accept */
  @Post('invitations/:token/accept')
  @UseGuards(JwtAuthGuard)
  accept(@Param('token') token: string, @Req() req: Request) {
    const user = req.user as User;
    return this.service.acceptInvite(token, user.id);
  }
}
