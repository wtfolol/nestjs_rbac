import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService :ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: any) {
    // payload = { sub: userId, role: 'admin', token_type: 'ACCESS_TOKEN' }
    if (payload.token_type !== 'ACCESS_TOKEN') {
      throw new Error('Invalid token type');
    }

    return payload;
  }
}
