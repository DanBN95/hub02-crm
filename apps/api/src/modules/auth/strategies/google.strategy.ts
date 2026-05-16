import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Profile, VerifyCallback } from 'passport-google-oauth20';
import { Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService, private readonly auth: AuthService) {
    super({
      clientID: config.get('GOOGLE_CLIENT_ID', 'placeholder'),
      clientSecret: config.get('GOOGLE_CLIENT_SECRET', 'placeholder'),
      callbackURL: config.get('GOOGLE_CALLBACK_URL', 'http://localhost:3000/auth/google/callback'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const email = profile.emails?.[0]?.value ?? '';
    const name = profile.displayName;
    const avatarUrl = profile.photos?.[0]?.value ?? null;

    const user = await this.auth.validateGoogle({
      googleId: profile.id,
      email,
      name,
      avatarUrl,
    });

    done(null, user);
  }
}
