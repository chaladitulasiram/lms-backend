import { Controller, Post, Body, UnauthorizedException, Get, UseGuards, Request, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() body: {
        email: string;
        password: string;
        name?: string;
        phone?: string;
        designation?: string;
        role?: string;
    }) {
        return this.authService.register(body);
    }

    @Post('login')
    async login(@Body() body: { email: string; password: string }) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Request() req) {
        return this.authService.getProfile(req.user.userId);
    }

    @Put('profile')
    @UseGuards(JwtAuthGuard)
    async updateProfile(@Request() req, @Body() body: {
        name?: string;
        phone?: string;
        designation?: string;
        bio?: string;
        avatar?: string;
    }) {
        return this.authService.updateProfile(req.user.userId, body);
    }
}