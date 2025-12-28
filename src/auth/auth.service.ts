import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from './dto/user.dto';
import { ConfigService } from '@nestjs/config';
import { GoogleUser } from './interfaces/google-user.interface';

@Injectable()
export class AuthService {
    private users = new Map<string, UserDto>();

    constructor(
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
    ) { }

    async validateGoogleUser(googleUser: GoogleUser): Promise<UserDto> {
        if (!googleUser.email || !googleUser.googleId) {
            throw new UnauthorizedException('Invalid Google profile data');
        }

        let user = this.users.get(googleUser.googleId);
        if (!user) {
            user = {
                id: googleUser.googleId,
                email: googleUser.email,
                fullName: googleUser.fullName,
                picture: googleUser.picture,
            };
            this.users.set(googleUser.googleId, user);
        }

        return user;
    }

    async getUserProfile(userId: string): Promise<UserDto> {
        const user = this.users.get(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return user;
    }

    async createJwt(user: UserDto): Promise<string> {
        if (!user || !user.email) {
            throw new UnauthorizedException('Invalid user payload');
        }

        const payload = { sub: user.id, email: user.email };
        const expiresIn = this.config.get<string>('JWT_EXPIRES_IN') ?? '1h';

        return this.jwtService.signAsync(payload, {
            expiresIn: expiresIn as any,
        });
    }
}
