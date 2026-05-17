import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  check() {
    return { ok: true, ts: new Date().toISOString() };
  }

  @Get('db')
  async checkDb() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ok: true, db: 'connected', ts: new Date().toISOString() };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown error';
      return { ok: false, db: 'error', error: message, ts: new Date().toISOString() };
    }
  }
}
