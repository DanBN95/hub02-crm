import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspaces: WorkspacesService) {}

  @Get()
  list(@Req() req: Request) {
    const user = req.user as User;
    return this.workspaces.findForUser(user.id);
  }
}
