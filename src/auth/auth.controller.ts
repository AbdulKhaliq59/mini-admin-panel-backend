import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { TokenDto } from './dto/token.dto';
import { UserDto } from './dto/user.dto';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly config: ConfigService) { }


    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {
        // Guard handles the redirect
    }


    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthCallback(@Req() req: any, @Res() res: Response): Promise<any> {
        const user: UserDto = req.user;
        const token = await this.authService.createJwt(user);
        const frontend = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const redirectTo = `${frontend.replace(/\/$/, '')}/auth/success#access_token=${encodeURIComponent(token)}`;
        return res.redirect(redirectTo);
    }
}
