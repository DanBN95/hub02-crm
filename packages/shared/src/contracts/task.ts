import { z } from 'zod';

export const PrioritySchema = z.enum(['P0', 'P1', 'P2', 'P3']);
export type Priority = z.infer<typeof PrioritySchema>;

export const StatusSchema = z.enum([
  'BACKLOG',
  'TODO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'DONE',
]);
export type Status = z.infer<typeof StatusSchema>;

export const TaskSchema = z.object({
  id: z.string().cuid(),
  workspaceId: z.string().cuid(),
  sprintId: z.string().cuid().nullable(),
  assigneeId: z.string().cuid().nullable(),
  title: z.string().min(1).max(255),
  description: z.string().nullable(),
  priority: PrioritySchema,
  status: StatusSchema,
  dueAt: z.coerce.date().nullable(),
  position: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Task = z.infer<typeof TaskSchema>;

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(10_000).optional(),
  priority: PrioritySchema.optional(),
  status: StatusSchema.optional(),
  sprintId: z.string().cuid().optional(),
  assigneeId: z.string().cuid().optional(),
  dueAt: z.string().datetime({ offset: true }).optional(),
});
export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;

export const UpdateTaskSchema = CreateTaskSchema.partial();
export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>;

export const TaskFiltersSchema = z.object({
  sprintId: z.string().cuid().optional(),
  assigneeId: z.string().cuid().optional(),
  status: StatusSchema.optional(),
  priority: PrioritySchema.optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  orderBy: z.enum(['createdAt', 'updatedAt', 'priority', 'status', 'position']).default('position'),
  order: z.enum(['asc', 'desc']).default('asc'),
});
export type TaskFilters = z.infer<typeof TaskFiltersSchema>;

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const PaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    nextCursor: z.string().nullable(),
    total: z.number().int(),
  });
