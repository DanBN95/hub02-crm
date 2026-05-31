import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Accepts both:
 *  - hub02 JWT (HS256, from cookie or Bearer header)
 *  - Google ID token (RS256, Bearer header — used by MCP clients like Claude Desktop)
 *
 * Passport tries each strategy in order; first success wins.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard(['jwt', 'google-bearer']) {
  override canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  override handleRequest<T>(err: Error | null, user: T): T {
    if (err || !user) throw err ?? new UnauthorizedException();
    return user;
  }
}
