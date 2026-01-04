import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('C2C_API', {
              colors: true,
              prettyPrint: true,
            }),
          ),
        }),
        new winston.transports.DailyRotateFile({
          dirname: 'logs',
          filename: 'application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),
  });
  
  // Disable ETag to prevent 304 responses
  app.set('etag', false);

  // Enable CORS for frontend access
  app.enableCors();
  
  // Use global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Listen on 0.0.0.0 to be accessible from outside the container
  await app.listen(3000, '0.0.0.0');
}
bootstrap();

