import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SprintsRepository } from './sprints.repository';
import { SprintsService } from './sprints.service';

const mockSprint = {
  id: 'sprint-1',
  workspaceId: 'ws-1',
  name: 'Sprint 1',
  goal: null,
  startsAt: null,
  endsAt: null,
  isActive: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const repoMock = {
  findMany: jest.fn().mockResolvedValue([mockSprint]),
  findById: jest.fn().mockResolvedValue(mockSprint),
  create: jest.fn().mockResolvedValue(mockSprint),
  update: jest.fn().mockResolvedValue(mockSprint),
  delete: jest.fn().mockResolvedValue(mockSprint),
  setActive: jest.fn().mockResolvedValue({ ...mockSprint, isActive: true }),
};

describe('SprintsService', () => {
  let service: SprintsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SprintsService,
        { provide: SprintsRepository, useValue: repoMock },
      ],
    }).compile();
    service = module.get(SprintsService);
  });

  it('lists sprints', async () => {
    const result = await service.list('ws-1');
    expect(result).toHaveLength(1);
  });

  it('finds one sprint', async () => {
    const sprint = await service.findOne('sprint-1');
    expect(sprint.id).toBe('sprint-1');
  });

  it('throws NotFoundException when sprint not found', async () => {
    repoMock.findById.mockResolvedValueOnce(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('creates a sprint', async () => {
    const sprint = await service.create('ws-1', { name: 'Sprint 2' });
    expect(sprint.name).toBe('Sprint 1');
  });

  it('activates a sprint', async () => {
    const sprint = await service.setActive('ws-1', 'sprint-1');
    expect(sprint.isActive).toBe(true);
  });
});
