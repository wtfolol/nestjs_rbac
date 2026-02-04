import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLoggerService } from '../logger/app-logger.service';

@Catch() // <-- catch EVERYTHING
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;

    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = isHttpException
      ? exception.getResponse()
      : 'Internal server error';

    const errorMessage =
      typeof errorResponse === 'string'
        ? errorResponse
        : (errorResponse as any)?.message || 'Unexpected error';

    const stack = exception instanceof Error ? exception.stack : undefined;

    // 🔴 Centralized logging
    // this.logger.error({
    //   statusCode: status,
    //   message: errorMessage,
    //   path: request.url,
    //   method: request.method,
    //   ip: request.ip,
    //   stack: exception instanceof Error ? exception.stack : null,
    // });
    this.logger.error('Unhandled exception', stack, {
      path: request.url,
      method: request.method,
      status,
    });

    // 🔥 Optional: send to Sentry / Datadog
    // Sentry.captureException(exception);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: errorMessage,
    });
  }
}
