import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class AppLoggerService implements LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        // winston.format.printf(
        //   ({
        //     timestamp,
        //     level,
        //     message,
        //     method,
        //     path,
        //     statusCode,
        //     durationMs,
        //   }) =>
        //     `${timestamp} | ${level} | ${method} ${path} | ${statusCode} | ${durationMs}ms | ${message}`,
        // ),
      ),
      transports: [
        new winston.transports.Console(),

        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),

        new winston.transports.File({
          filename: 'logs/app.log',
        }),
      ],
    });
  }

  log(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  error(message: string, trace?: string, meta?: any) {
    this.logger.error(message, {
      trace,
      ...meta,
    });

    // 🔥 Optional alert hook
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureMessage(message);
    // }
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }

  verbose(message: string, meta?: any) {
    this.logger.verbose(message, meta);
  }
}
