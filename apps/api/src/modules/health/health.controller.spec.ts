import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { HealthController } from './health.controller';

const mockPrisma = { $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) };

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    controller = module.get(HealthController);
  });

  it('returns ok: true with a timestamp', () => {
    const result = controller.check();
    expect(result.ok).toBe(true);
    expect(typeof result.ts).toBe('string');
    expect(new Date(result.ts).toISOString()).toBe(result.ts);
  });

  it('checkDb returns ok: true when DB responds', async () => {
    const result = await controller.checkDb();
    expect(result.ok).toBe(true);
    expect(result.db).toBe('connected');
  });
});
