import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthUser } from '../../../common/types/auth-user.type';
import { Request } from 'express';

interface RefreshPayload extends AuthUser {
  sub: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey:
        config.get<string>('jwt.refreshSecret') ??
        config.get<string>('JWT_REFRESH_SECRET') ??
        'refresh-secret',
    });
  }

  validate(req: Request, payload: RefreshPayload): RefreshPayload & { rawToken: string } {
    const rawToken =
      (req.body as { refreshToken?: string }).refreshToken ?? '';
    return { ...payload, rawToken };
  }
}
