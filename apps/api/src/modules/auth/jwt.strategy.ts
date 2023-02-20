import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { jwtConstants } from './constats';
import { Injectable } from '@nestjs/common';
import { PublicUser } from '@blog/entities';
import { omit } from '@tool-pack/basic';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }
  // JWT验证 - Step 4: 被守卫调用
  async validate(payload: PublicUser & { iat: number; exp: number }) {
    // console.log(`JWT验证 - Step 4: 被守卫调用`);
    return omit(payload, ['iat', 'exp']);
  }
}
