import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: { usernameOrEmail: string; pass: string }) {
    return this.authService.signIn(signInDto.usernameOrEmail, signInDto.pass);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
