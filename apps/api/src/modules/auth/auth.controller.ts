import { Controller, Post, Get, Body, UseGuards, Req, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('github')
  @HttpCode(200)
  async authenticateGithub(@Body('code') code: string) {
    return this.authService.authenticateGithub(code);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logout() {
    return { success: true, message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return this.authService.getMe(req.user.sub);
  }
}
