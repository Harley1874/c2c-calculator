import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    if (exception instanceof HttpException) {
        const res = exception.getResponse();
        message = (typeof res === 'object' && (res as any).message) ? (res as any).message : exception.message;
    }

    // Unify all auth related errors to 401
    if (status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN || message === 'User no longer exists') {
        response.status(HttpStatus.UNAUTHORIZED).json({
            statusCode: HttpStatus.UNAUTHORIZED,
            message: 'Unauthorized',
            timestamp: new Date().toISOString(),
        });
        return;
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}

