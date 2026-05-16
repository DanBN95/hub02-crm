import { z } from 'zod';

export const SprintSchema = z.object({
  id: z.string().cuid(),
  workspaceId: z.string().cuid(),
  name: z.string().min(1).max(100),
  goal: z.string().nullable(),
  startsAt: z.coerce.date().nullable(),
  endsAt: z.coerce.date().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Sprint = z.infer<typeof SprintSchema>;

export const CreateSprintSchema = SprintSchema.pick({
  workspaceId: true,
  name: true,
  goal: true,
  startsAt: true,
  endsAt: true,
});
export type CreateSprintDto = z.infer<typeof CreateSprintSchema>;
