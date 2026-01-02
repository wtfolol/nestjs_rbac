import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    console.log('🔥 Prisma Filter caught:', exception.code); // debug

    switch (exception.code) {
      case 'P2002':
        return response.status(409).json({
          statusCode: 409,
          message: 'Duplicate field',
        });

      case 'P2025':
        return response.status(404).json({
          statusCode: 404,
          message: 'Record not found',
        });

      default:
        return response.status(400).json({
          statusCode: 400,
          message: exception.message,
        });
    }
  }
}
