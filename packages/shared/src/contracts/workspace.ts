import { z } from 'zod';

export const WorkspaceSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;

export const CreateWorkspaceSchema = WorkspaceSchema.pick({ name: true, slug: true });
export type CreateWorkspaceDto = z.infer<typeof CreateWorkspaceSchema>;
