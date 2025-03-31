import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { Token, TokenSchema } from './schema/token.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RedisModule } from 'src/redis/redis.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Token.name, schema: TokenSchema }
    ]),
    RedisModule,
    MailModule
  ],
  controllers: [
    AuthController,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: 'JWT_ACCESS_SERVICE',
      useFactory: (configService: ConfigService) => {
        return new JwtService({
          secret: configService.get<string>('JWT_ACCESS_SECRET_KEY'),
          signOptions: {
            expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION')
          }
        });
      },
      inject: [ConfigService]
    },
    {
      provide: 'JWT_REFRESH_SERVICE',
      useFactory: (configService: ConfigService) => {
        return new JwtService({
          secret: configService.get<string>('JWT_REFRESH_SECRET_KEY'),
          signOptions: {
            expiresIn: configService.get<string>('JWT_REFRESH_EXPIRATION')
          }
        });
      },
      inject: [ConfigService]
    }
  ],
  exports: [
    PassportModule,
    MongooseModule
  ]
})
export class AuthModule {}
