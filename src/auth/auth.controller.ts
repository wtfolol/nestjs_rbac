import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Roles } from './roles.decorator';
import { Role } from './roles.enum';
import { JwtRefreshGuard } from './guards/refresh.guard';
import { JwtAuthGuard } from './guards/access.guard';
import { RolesGuard } from './guards/roles.guard';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { create } from 'handlebars/runtime';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  @Post('register')
  create(@Body() createAuthDto: CreateAuthDto) {
    console.log(createAuthDto.email);
    return this.authService.register(
      createAuthDto.email,
      createAuthDto.password,
    );
  }

  @Post('login')
  login(@Body() createAuthDto: CreateAuthDto, @Req() req) {
    // return this.configService.get<string>('JWT_ACCESS_SECRET');
    const details = {
      ip: req.headers['x-forwarded-for'] || req.ip,
      device: req.headers['user-agent'],
      loginTimestamp: new Date(),
    };
    return this.authService.login(
      createAuthDto.email,
      createAuthDto.password,
      details,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logOut(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.logout(createAuthDto.email, createAuthDto.password);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.refresh(
      createAuthDto.email,
      createAuthDto.password,
      createAuthDto.refresh_token,
    );
  }

  // @Throttle({})
  @Get('test')
  sendMail() {
    // return this.mailService.sendWelcomeEmail('xiao.wsl@gmail.com', 'stfu');
    return 'asd';
  }

  @Post('verify')
  verifyEmail(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.verify(createAuthDto.verify_token);
  }

  @Post('sendresetpasswordemail')
  sendResetPasswordEmail(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.sendResetPasswordEmail(createAuthDto.email);
  }

  @Post('resetpassword')
  resetPassword(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.resetPassword(
      createAuthDto.verify_token,
      createAuthDto.password,
    );
  }

  @UseGuards(JwtRefreshGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Get('admin-only')
  adminOnly() {
    return 'This route is only accessible to admins';
  }
}
