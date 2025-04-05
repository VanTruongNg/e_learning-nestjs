import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from '@nestjs/config';
import { Strategy } from "passport-google-oauth20";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private configService: ConfigService
    ){
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
            scope: ['profile', 'email'],
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: any) {
        const { name, emails, photos } = profile;

        return {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            photo: photos[0].value,
            accessToken
        }
    }
}