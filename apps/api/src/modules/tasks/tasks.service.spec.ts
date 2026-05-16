import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Priority, Status } from '@prisma/client';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';

const mockTask = {
  id: 'task-1',
  workspaceId: 'ws-1',
  title: 'Test task',
  description: null,
  priority: Priority.P2,
  status: Status.BACKLOG,
  sprintId: null,
  assigneeId: null,
  dueAt: null,
  position: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  assignee: null,
  sprint: null,
};

const repoMock = {
  findMany: jest.fn().mockResolvedValue({ items: [mockTask], nextCursor: null, total: 1 }),
  findById: jest.fn().mockResolvedValue(mockTask),
  create: jest.fn().mockResolvedValue(mockTask),
  update: jest.fn().mockResolvedValue(mockTask),
  delete: jest.fn().mockResolvedValue(mockTask),
  bulkUpdateStatus: jest.fn().mockResolvedValue(1),
  bulkDelete: jest.fn().mockResolvedValue(1),
};

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TasksRepository, useValue: repoMock },
      ],
    }).compile();
    service = module.get(TasksService);
  });

  it('lists tasks', async () => {
    const result = await service.list('ws-1', {});
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('finds one task', async () => {
    const task = await service.findOne('task-1');
    expect(task.id).toBe('task-1');
  });

  it('throws NotFoundException for unknown task', async () => {
    repoMock.findById.mockResolvedValueOnce(null);
    await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
  });

  it('creates a task with defaults', async () => {
    await service.create('ws-1', { title: 'New task' }, 'user-1');
    expect(repoMock.create).toHaveBeenCalledWith(
      'ws-1',
      expect.objectContaining({ title: 'New task', priority: Priority.P2, status: Status.BACKLOG }),
    );
  });
});
