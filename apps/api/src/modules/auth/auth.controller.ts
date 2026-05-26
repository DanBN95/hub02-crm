import {
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { User } from '@prisma/client';
import type { Request, Response } from 'express';
import { WorkspacesRepository } from '../workspaces/workspaces.repository';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
    private readonly config: ConfigService,
    private readonly workspaces: WorkspacesRepository,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as User;
    const origin = this.config.get<string>('WEB_ORIGIN', 'http://localhost:5173');

    const token = this.auth.signToken(user);
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000,
    });

    const memberCount = await this.workspaces.memberCount(user.id);
    if (memberCount === 0) {
      res.redirect(`${origin}?onboard=1`);
      return;
    }

    res.redirect(origin);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request) {
    return req.user;
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('access_token');
    res.json({ ok: true });
  }

  /** Dev/staging-only: sign in as the seeded demo user without Google OAuth.
   *  Enabled when NODE_ENV !== 'production' OR ALLOW_DEV_LOGIN=true. */
  @Post('dev-login')
  async devLogin(@Res() res: Response) {
    const allowed =
      process.env['NODE_ENV'] !== 'production' ||
      process.env['ALLOW_DEV_LOGIN'] === 'true';
    if (!allowed) {
      res.status(403).json({ message: 'Not available in production' });
      return;
    }
    const user = await this.users.findByEmail('demo@hub02.io');
    if (!user) throw new NotFoundException('Demo user not found — run the seed first');
    const token = this.auth.signToken(user);
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ ok: true, userId: user.id });
  }
}
