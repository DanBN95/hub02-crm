import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamsService } from './teams.service';

class AddMemberDto {
  userId!: string;
}

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

  @Post(':teamId/members')
  addMember(@Param('teamId') teamId: string, @Body() body: AddMemberDto) {
    return this.service.addMember(teamId, body.userId);
  }

  @Delete(':teamId/members/:userId')
  @HttpCode(204)
  removeMember(@Param('teamId') teamId: string, @Param('userId') userId: string) {
    return this.service.removeMember(teamId, userId);
  }
}
