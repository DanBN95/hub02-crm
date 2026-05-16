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
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';
import { SprintsService } from './sprints.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class SprintsController {
  constructor(private readonly sprints: SprintsService) {}

  @Get('workspaces/:workspaceId/sprints')
  list(@Param('workspaceId') workspaceId: string) {
    return this.sprints.list(workspaceId);
  }

  @Post('workspaces/:workspaceId/sprints')
  create(@Param('workspaceId') workspaceId: string, @Body() dto: CreateSprintDto) {
    return this.sprints.create(workspaceId, dto);
  }

  @Get('sprints/:id')
  findOne(@Param('id') id: string) {
    return this.sprints.findOne(id);
  }

  @Patch('sprints/:id')
  update(@Param('id') id: string, @Body() dto: UpdateSprintDto) {
    return this.sprints.update(id, dto);
  }

  @Delete('sprints/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.sprints.remove(id);
  }

  @Patch('workspaces/:workspaceId/sprints/:id/activate')
  activate(@Param('workspaceId') workspaceId: string, @Param('id') id: string) {
    return this.sprints.setActive(workspaceId, id);
  }
}
