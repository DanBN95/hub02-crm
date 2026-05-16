import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  override handleRequest<T>(err: Error | null, user: T): T {
    if (err || !user) throw err ?? new UnauthorizedException();
    return user;
  }
}
