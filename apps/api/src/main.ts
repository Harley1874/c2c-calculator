import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
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

