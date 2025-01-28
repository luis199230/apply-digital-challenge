import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

export type Signature = {
  iat: number;
  exp: number;
};

export type PassportUser = { sub: string };

export type JWT = Signature & PassportUser;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || '',
    });
  }

  validate(jwt: JWT): boolean {
    const { sub } = jwt;
    console.log('sub', sub);
    if (sub !== 'uuid') throw new UnauthorizedException();
    return true;
  }
}
