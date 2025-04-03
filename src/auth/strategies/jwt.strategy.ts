import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';
import { createBlacklistKey } from '../../config/redis.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private redisService: RedisService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET_KEY')
        });
    }

    async validate(payload: any) {
        try {
            if (payload.type === 'refresh') {
                throw new ForbiddenException('Refresh token is not allowed to access this resource');
            }

            if (!payload.jti) {
                throw new UnauthorizedException('Invalid token format');
            }

            const isBlacklisted = await this.redisService.exists(createBlacklistKey(payload.jti));
            if (isBlacklisted) {
                throw new UnauthorizedException('Token has been revoked');
            }

            return {
                userId: payload.sub,
                email: payload.email,
            };
        } catch (error) {
            throw new UnauthorizedException(
                error instanceof UnauthorizedException 
                    ? error.message 
                    : 'Invalid token'
            );
        }
    }
}
