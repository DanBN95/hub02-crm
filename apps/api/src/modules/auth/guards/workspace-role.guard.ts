import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { User } from '@prisma/client';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { WORKSPACE_ROLE_KEY } from '../decorators/workspace-roles.decorator';

const ROLE_ORDER = ['viewer', 'editor', 'admin'] as const;

@Injectable()
export class WorkspaceRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const minRole = this.reflector.getAllAndOverride<string | undefined>(WORKSPACE_ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!minRole) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user as User | undefined;
    if (!user) return false;

    const params = req.params as Record<string, string>;
    let workspaceId: string | undefined = params['workspaceId'];

    if (!workspaceId) {
      const id: string | undefined = params['id'] ?? params['taskId'];
      if (id) {
        const task = await this.prisma.task.findUnique({
          where: { id },
          select: { workspaceId: true },
        });
        if (task) {
          workspaceId = task.workspaceId;
        } else {
          const sprint = await this.prisma.sprint.findUnique({
            where: { id },
            select: { workspaceId: true },
          });
          if (sprint) {
            workspaceId = sprint.workspaceId;
          }
        }
      }
    }

    if (!workspaceId) return false;

    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: user.id } },
    });

    if (!member) return false;

    const memberIdx = ROLE_ORDER.indexOf(member.role as typeof ROLE_ORDER[number]);
    const minIdx = ROLE_ORDER.indexOf(minRole as typeof ROLE_ORDER[number]);

    if (memberIdx === -1 || minIdx === -1) return false;

    return memberIdx >= minIdx;
  }
}
