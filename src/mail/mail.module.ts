// // src/mail/mail.module.ts
// import { Module } from '@nestjs/common';
// import { MailerModule } from '@nestjs-modules/mailer';
// import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
// import { join } from 'path';
// import { MailService } from './mail.service';
// import { ConfigModule, ConfigService } from '@nestjs/config';

// @Module({
//   imports: [
//     ConfigModule,
//     MailerModule.forRootAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: async (config: ConfigService) => ({
//         transport: {
//           host: config.get<string>('MAIL_HOST'),
//           port: config.get<number>('MAIL_PORT'),
//           secure: config.get<string>('MAIL_SECURE') === 'true',
//           auth: {
//             user: config.get<string>('MAIL_USER'),
//             pass: config.get<string>('MAIL_PASS'),
//           },
//         },

//         defaults: {
//           from: config.get<string>('MAIL_FROM', '"No Reply" <noreply@app.com>'),
//         },
//         template: {
//           dir: join(__dirname, 'templates'),
//           adapter: new HandlebarsAdapter(),
//         },
//       }),
//     }),
//   ],
//   providers: [MailService],
//   exports: [MailService],
// })
// export class MailModule {}

import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { resolveTemplateDir } from './mail-path.util';

export const mailerModule = MailerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const templateDir = resolveTemplateDir();

    return {
      transport: {
        host: config.get('MAIL_HOST'),
        port: config.get<number>('MAIL_PORT'),
        secure: config.get<string>('MAIL_SECURE') === 'true',
        auth: {
          user: config.get('MAIL_USER'),
          pass: config.get('MAIL_PASS'),
        },
      },
      defaults: {
        from: `"No Reply" <${config.get('MAIL_USER')}>`,
      },
      template: {
        dir: templateDir,
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    };
  },
});
