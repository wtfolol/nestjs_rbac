import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from '../mail/mail.service';
import { HttpStatusCode } from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private userService: UserService,
    private configService: ConfigService,
    private mailerService: MailService,
  ) {}

  async register(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword },
    });

    if (user) {
      const verificationToken = await this.generateEmailVerificationToken(
        user.id,
      );
      await this.mailerService.sendAccountVerificationEmail(
        email,
        email,
        'www.test.com?token=' + verificationToken.tokenHash,
      );
      return {
        statusCode: HttpStatus.ACCEPTED,
        message: 'A verification email has sent, please check your email.',
      };
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
    };
  }

  async verify(hashedToken: string) {
    const token = await this.validateVerificationToken(hashedToken);

    try {
      await this.prisma.user.update({
        where: {
          id: token.userId,
          isVerified: 0,
        },
        data: {
          isVerified: 1,
        },
      });

      await this.prisma.emailVerificationToken.delete({
        where: { tokenHash: hashedToken },
      });
    } catch (error) {
      console.error(error);
      throw error; // rethrow so Nest can handle it
    }
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'User verified successfully',
    };
  }

  async sendResetPasswordEmail(email: string) {
    const user = await this.userService.validateUserEmail(email);
    const verificationToken = await this.generateEmailVerificationToken(
      user.id,
    );
    await this.mailerService.sendResetPasswordEmail(
      email,
      email,
      'www.test.com?token=' + verificationToken.tokenHash,
    );

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Password reset email has sent, please check your email.',
    };
  }

  async resetPassword(hashedToken: string, password: string) {
    const token = await this.validateVerificationToken(hashedToken);
    if (token) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userDetails = await this.userService.getUserDetailsById(
        token.userId,
      );
      const userUpdate = await this.prisma.user.update({
        where: { id: token.userId, isVerified: 1 },
        data: { password: hashedPassword, prevpassword: userDetails.password },
      });
      if (!userUpdate) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found or not verified.',
        };
      }
      await this.prisma.emailVerificationToken.delete({
        where: { tokenHash: hashedToken },
      });
    }
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'User password reset successfully',
    };
  }

  async login(email: string, password: string, details: any) {
    const validate = await this.userService.validateUser(email, password);
    if (validate) {
      const tokens = await this.generateTokens(validate.id, 'admin', details);

      await this.userService.updateRefreshToken(
        email,
        password,
        tokens.refresh_token,
        '',
      );

      return {
        statusCode: HttpStatus.ACCEPTED,
        message: 'User logged in successfully',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      };
    }
  }

  async logout(email: string, password: string) {
    const validate = await this.userService.validateUser(email, password);
    if (validate) {
      await this.userService.updateRefreshToken(
        email,
        password,
        '',
        validate.hashedtoken,
      );
      return {
        statusCode: HttpStatus.ACCEPTED,
        message: 'User logged out successfully',
      };
    }
  }

  async refresh(email: string, password: string, refreshToken: string) {
    const user = await this.userService.validateUser(email, password);
    if (user.hashedtoken !== refreshToken) {
      throw new ForbiddenException(''); // need to flag ip etc
    }
    const tokens = await this.generateTokens(user.id, 'admin');

    await this.userService.updateRefreshToken(
      email,
      password,
      tokens.refresh_token,
      user.hashedtoken,
    );

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'User logged in successfully',
      tokens,
    };
  }

  async generateTokens(userId, userRole, reqDetails?) {
    const access_token = await this.jwt.sign(
      { sub: userId, role: userRole, token_type: 'ACCESS_TOKEN' },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '10m',
      },
    );
    const refresh_token = await this.jwt.sign(
      { sub: userId, role: userRole, token_type: 'REFRESH_TOKEN', reqDetails },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );

    return {
      access_token: access_token,
      refresh_token: refresh_token,
    };
  }

  async generateEmailVerificationToken(userId: string) {
    const hashedId = await bcrypt.hash(userId, 10);

    return await this.prisma.emailVerificationToken.create({
      data: {
        user: {
          connect: { id: userId },
        },
        tokenHash: hashedId,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
  }

  async validateVerificationToken(hashedToken: string) {
    const token = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash: hashedToken },
    });

    if (!token) {
      throw new BadRequestException('Invalid token');
    }

    const now = Date.now();

    if (token.expiresAt.getTime() <= now) {
      throw new BadRequestException('Token expired');
    }

    const minutesLeft = Math.ceil(
      (token.expiresAt.getTime() - now) / (60 * 1000),
    );

    console.log(`Token valid for ${minutesLeft} more minute(s)`);

    return token;
  }
}
