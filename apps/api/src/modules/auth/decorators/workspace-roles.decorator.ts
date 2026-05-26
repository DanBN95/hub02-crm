import { SetMetadata } from '@nestjs/common';

export const WORKSPACE_ROLE_KEY = 'workspace_role';
export const RequireRole = (minRole: 'viewer' | 'editor' | 'admin') =>
  SetMetadata(WORKSPACE_ROLE_KEY, minRole);
