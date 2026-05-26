import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import type { Request } from 'express';
import type { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceRoleGuard } from '../auth/guards/workspace-role.guard';
import { RequireRole } from '../auth/decorators/workspace-roles.decorator';
import { WorkspacesService } from './workspaces.service';

class CreateWorkspaceDto {
  @IsString()
  @MinLength(2)
  name!: string;
}

class UpdateWorkspaceNameDto {
  @IsString()
  @MinLength(1)
  name!: string;
}

class UpdateMemberRoleDto {
  @IsString()
  role!: string;
}

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspaces: WorkspacesService) {}

  @Get()
  list(@Req() req: Request) {
    const user = req.user as User;
    return this.workspaces.findForUser(user.id);
  }

  @Post()
  create(@Req() req: Request, @Body() dto: CreateWorkspaceDto) {
    const user = req.user as User;
    return this.workspaces.createWorkspace(dto.name, user.id);
  }

  @Patch(':workspaceId/name')
  @UseGuards(WorkspaceRoleGuard)
  @RequireRole('admin')
  updateName(@Param('workspaceId') workspaceId: string, @Body() dto: UpdateWorkspaceNameDto) {
    return this.workspaces.updateWorkspaceName(workspaceId, dto.name);
  }

  @Delete(':workspaceId')
  @UseGuards(WorkspaceRoleGuard)
  @RequireRole('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteWorkspace(@Param('workspaceId') workspaceId: string) {
    return this.workspaces.deleteWorkspace(workspaceId);
  }

  @Get(':workspaceId/members')
  members(@Param('workspaceId') workspaceId: string) {
    return this.workspaces.findMembers(workspaceId);
  }

  @Patch(':workspaceId/members/:userId/role')
  @UseGuards(WorkspaceRoleGuard)
  @RequireRole('admin')
  updateMemberRole(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.workspaces.updateMemberRole(workspaceId, userId, dto.role);
  }

  @Delete(':workspaceId/members/:userId')
  @UseGuards(WorkspaceRoleGuard)
  @RequireRole('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
  ) {
    return this.workspaces.removeMember(workspaceId, userId);
  }
}
