import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      this.logger.error('Prisma failed to connect on startup — DB may not be ready', err);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
