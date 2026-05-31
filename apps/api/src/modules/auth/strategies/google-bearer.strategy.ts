import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { UsersService } from '../../users/users.service';

interface GoogleTokenPayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  iss: string;
  aud: string;
}

/**
 * Validates Google ID tokens sent as Bearer tokens by MCP clients (Claude Desktop, etc.)
 * after they complete Google OAuth via the MCP server's OAuth proxy.
 *
 * Flow:
 *   Claude → OAuth via MCP proxy → Google issues id_token
 *   MCP proxy swaps id_token → access_token
 *   Claude sends: Authorization: Bearer <google-id-token>
 *   This strategy verifies the signature via Google's JWKS and looks up the user by email.
 */
@Injectable()
export class GoogleBearerStrategy extends PassportStrategy(Strategy, 'google-bearer') {
  constructor(
    private readonly config: ConfigService,
    private readonly users: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
      }),
      issuer: 'https://accounts.google.com',
      audience: config.get<string>('GOOGLE_CLIENT_ID'),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: GoogleTokenPayload) {
    if (!payload.email) return null;
    return this.users.findByEmail(payload.email);
  }
}
