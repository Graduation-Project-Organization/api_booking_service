import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        // Extract JWT token from Authorization header or cookie
        if (req.cookies?.jwt) {
          return req.cookies.jwt;
        }
        return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    console.log('JWT Payload:', payload);
    if (!payload) {
      throw new UnauthorizedException();
    }
    return {
      userId: payload.userId,
      role: payload.role,
      email: payload.email,
      username: payload.username,
    };
  }
}

// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor() {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: process.env.JWT_SECRET,
//     });
//   }

//   async validate(payload: any) {
//     console.log('payload', payload);
//     if (!payload) {
//       throw new UnauthorizedException();
//     }
//     return {
//       userId: payload.userId,
//       role: payload.role,
//     };
//   }
// }
