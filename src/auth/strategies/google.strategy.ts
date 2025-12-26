import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UserDto } from '../dto/user.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly config: ConfigService) {
        const clientID = config.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = config.get<string>('GOOGLE_CLIENT_SECRET');
        const callbackURL = config.get<string>('GOOGLE_CALLBACK_URL');

        if (!clientID || !clientSecret || !callbackURL) {
            throw new Error(
                'Google OAuth environment variables are not properly defined',
            );
        }

        super({
            clientID,
            clientSecret,
            callbackURL,
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ) {
        const email = profile.emails && profile.emails[0] && profile.emails[0].value;
        const user: UserDto = {
            id: profile.id ?? randomUUID(),
            email: email ?? '',
            displayName: profile.displayName,
            picture: profile.photos && profile.photos[0] && profile.photos[0].value,
        };
        return done(null, user);
    }
}
