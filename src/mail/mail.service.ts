// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { join } from 'path';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendWelcomeEmail(to: string, name: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Welcome to Our App',
      template: 'welcome',
      context: {
        name,
      },
    });
  }

  async sendAccountVerificationEmail(to: string, name: string, link: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Verify your email',
      template: 'emailVerification',
      context: {
        name,
        link,
      },
    });
  }

  async sendResetPasswordEmail(to: string, name: string, link: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Password Reset',
      template: 'emailResetPassword',
      context: {
        name,
        link,
      },
    });
  }


  async sendPlainEmail(to: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Test Email',
      text: 'Hello from NestJS Mailer',
    });
  }
}
