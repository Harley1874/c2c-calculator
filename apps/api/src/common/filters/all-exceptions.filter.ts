import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    if (exception instanceof HttpException) {
        const res = exception.getResponse();
        message = (typeof res === 'object' && (res as any).message) ? (res as any).message : exception.message;
    }

    // Log the error
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
            `Status: ${status} Error: ${JSON.stringify(message)} Path: ${request.url}`,
            exception instanceof Error ? exception.stack : '',
        );
    } else {
        this.logger.warn(
            `Status: ${status} Error: ${JSON.stringify(message)} Path: ${request.url}`,
        );
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

