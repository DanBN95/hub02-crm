import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();
    controller = module.get(HealthController);
  });

  it('returns ok: true with a timestamp', () => {
    const result = controller.check();
    expect(result.ok).toBe(true);
    expect(typeof result.ts).toBe('string');
    expect(new Date(result.ts).toISOString()).toBe(result.ts);
  });
});
