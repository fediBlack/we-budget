import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// 🎯 Type personnalisé pour req.user (ajouté par JwtStrategy)
interface RequestWithUser extends ExpressRequest {
  user: {
    userId: number;
    email: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 📝 POST /auth/register
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // 🔑 POST /auth/login
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // 🔄 POST /auth/refresh
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  // 🚪 POST /auth/logout (protégé par JWT)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req: RequestWithUser) {
    return this.authService.logout(req.user.userId);
  }

  // 👤 GET /auth/me (protégé par JWT)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Request() req: RequestWithUser) {
    return this.authService.getCurrentUser(req.user.userId);
  }
}
