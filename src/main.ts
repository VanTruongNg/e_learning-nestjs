import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cookie parser
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: 'http://localhost:4000',
    credentials: true
  });


  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true
  }));

  // Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('E-Learning API')
    .setDescription(`
      ## Authentication Flows
      
      ### Login Flow:
      1. Call POST /auth/login để nhận access_token và refresh_token cookie
      2. Sử dụng access_token trong Authorization header cho các protected routes
      
      ### Refresh Flow:
      1. Call POST /auth/refresh với refresh_token cookie để nhận access_token mới
      
      ### Logout Flow:
      1. Call POST /auth/logout với:
         - Authorization header: Bearer {access_token}
         - HttpOnly cookie refresh_token (tự động gửi bởi browser)
         
      Note: Swagger UI không hỗ trợ test với HttpOnly cookies. Vui lòng sử dụng Postman hoặc client khác để test đầy đủ flow.
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'access-token',
    )
    .addCookieAuth(
      'refresh_token',
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'refresh_token'
      },
      'refresh-token'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}

bootstrap();
