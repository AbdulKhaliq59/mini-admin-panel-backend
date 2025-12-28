import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { GoogleUser } from '../interfaces/google-user.interface';

function extractFullName(profile: Profile): string {
    const givenName = profile.name?.givenName || '';
    const familyName = profile.name?.familyName || '';
    const fullName = `${givenName} ${familyName}`.trim();
    return fullName || profile.displayName || '';
}

function extractGoogleUser(profile: Profile): GoogleUser {
    return {
        googleId: profile.id,
        email: profile.emails?.[0]?.value || '',
        fullName: extractFullName(profile),
        picture: profile.photos?.[0]?.value,
    };
}

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
        profile: Profile,
        done: VerifyCallback,
    ): Promise<void> {
        const user = extractGoogleUser(profile);
        done(null, user);
    }
}
