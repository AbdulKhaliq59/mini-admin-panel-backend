import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { GoogleUser } from './interfaces/google-user.interface';
import type { Response } from 'express';

interface RequestWithUser extends Request {
    user: GoogleUser;
}

interface RequestWithJwtUser extends Request {
    user: { id: string; email: string };
}

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly config: ConfigService,
    ) { }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {
        // Guard handles the redirect
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthCallback(
        @Req() req: RequestWithUser,
        @Res() res: Response,
    ): Promise<void> {
        const user = await this.authService.validateGoogleUser(req.user);
        const accessToken = await this.authService.createJwt(user);

        const frontend = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const redirectTo = `${frontend.replace(/\/$/, '')}/auth/success#access_token=${encodeURIComponent(accessToken)}`;

        res.redirect(redirectTo);
    }

    @Get('profile')
    @UseGuards(AuthGuard('jwt'))
    async getProfile(@Req() req: RequestWithJwtUser) {
        return this.authService.getUserProfile(req.user.id);
    }
}
