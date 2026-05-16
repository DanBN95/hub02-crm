import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string(),
  avatarUrl: z.string().url().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.pick({ email: true, name: true, avatarUrl: true });
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
