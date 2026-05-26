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
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import type { Request } from 'express';
import { IsArray, IsEnum, IsString } from 'class-validator';
import { Status } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceRoleGuard } from '../auth/guards/workspace-role.guard';
import { RequireRole } from '../auth/decorators/workspace-roles.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskFiltersDto } from './dto/task-filters.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

class BulkStatusDto {
  @IsArray()
  @IsString({ each: true })
  ids!: string[];

  @IsEnum(Status)
  status!: Status;
}

class BulkDeleteDto {
  @IsArray()
  @IsString({ each: true })
  ids!: string[];
}

@Controller()
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get('workspaces/:workspaceId/tasks')
  @UseGuards(JwtAuthGuard)
  list(@Param('workspaceId') workspaceId: string, @Query() filters: TaskFiltersDto) {
    return this.tasks.list(workspaceId, filters);
  }

  @Post('workspaces/:workspaceId/tasks')
  @UseGuards(JwtAuthGuard, WorkspaceRoleGuard)
  @RequireRole('editor')
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateTaskDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.tasks.create(workspaceId, dto, user.id);
  }

  @Get('tasks/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.tasks.findOne(id);
  }

  @Patch('tasks/:id')
  @UseGuards(JwtAuthGuard, WorkspaceRoleGuard)
  @RequireRole('editor')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasks.update(id, dto);
  }

  @Delete('tasks/:id')
  @UseGuards(JwtAuthGuard, WorkspaceRoleGuard)
  @RequireRole('editor')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.tasks.remove(id);
  }

  @Patch('workspaces/:workspaceId/tasks/bulk-status')
  @UseGuards(JwtAuthGuard, WorkspaceRoleGuard)
  @RequireRole('editor')
  bulkStatus(@Body() dto: BulkStatusDto) {
    return this.tasks.bulkUpdateStatus(dto.ids, dto.status);
  }

  @Delete('workspaces/:workspaceId/tasks/bulk')
  @UseGuards(JwtAuthGuard, WorkspaceRoleGuard)
  @RequireRole('editor')
  @HttpCode(HttpStatus.NO_CONTENT)
  async bulkDelete(@Body() dto: BulkDeleteDto) {
    await this.tasks.bulkDelete(dto.ids);
  }

  @Get('workspaces/:workspaceId/sprints/:sprintId/board')
  @UseGuards(JwtAuthGuard)
  getBoardColumns(
    @Param('workspaceId') workspaceId: string,
    @Param('sprintId') sprintId: string,
  ) {
    return this.tasks.getBoardColumns(workspaceId, sprintId);
  }
}
