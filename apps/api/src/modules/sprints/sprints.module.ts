import { Module } from '@nestjs/common';
import { SprintsController } from './sprints.controller';
import { SprintsRepository } from './sprints.repository';
import { SprintsService } from './sprints.service';

@Module({
  controllers: [SprintsController],
  providers: [SprintsService, SprintsRepository],
})
export class SprintsModule {}
