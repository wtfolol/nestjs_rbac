import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessStrategy } from './strategies/access.strategy';
import { JwtRefreshStrategy } from './strategies/refresh.strategy';
import { UserModule } from '../user/user.module';
import { mailerModule } from '../mail/mail.module';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [PrismaModule, JwtModule, UserModule, mailerModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    MailService
  ],
})
export class AuthModule {}
