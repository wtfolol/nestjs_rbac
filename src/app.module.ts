import { ExecutionContext, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { mailerModule } from './mail/mail.module';
import {
  minutes,
  seconds,
  ThrottlerGuard,
  ThrottlerModule,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { createHash } from 'crypto';
import { LoggerModule } from './common/logger/logger.module';
import { RequestLoggerInterceptor } from './common/interceptor/request-logger.interceptor';
import { AllExceptionsFilter } from './common/filter/all-exception.filter';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    ConfigModule.forRoot({ isGlobal: true }),
    mailerModule,
    LoggerModule, 
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'long',
          limit: 20,
          ttl: seconds(60),
          blockDuration: minutes(10),
        },
      ],
      errorMessage: 'wow relax',

      // default config (host = localhost, port = 6379)
      storage: new ThrottlerStorageRedisService(),
      getTracker: (req: Record<string, any>, context: ExecutionContext) => {
        return req.headers['x-tenant-id'];
      },
      generateKey: (
        context: ExecutionContext,
        trackerString: string,
        throttlerName: string,
      ) => {
        return createHash('sha256')
          .update(`${throttlerName}:${trackerString}`)
          .digest('hex');
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
