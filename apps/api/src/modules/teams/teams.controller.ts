import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamsService } from './teams.service';

@UseGuards(JwtAuthGuard)
@Controller('workspaces/:workspaceId/teams')
export class TeamsController {
  constructor(private readonly service: TeamsService) {}

  @Get()
  list(@Param('workspaceId') workspaceId: string) {
    return this.service.list(workspaceId);
  }

  @Post()
  create(@Param('workspaceId') workspaceId: string, @Body() dto: CreateTeamDto) {
    return this.service.create(workspaceId, dto);
  }
}
