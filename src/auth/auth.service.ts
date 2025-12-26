import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from './dto/user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
    ) { }


    async createJwt(user: UserDto) {
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
