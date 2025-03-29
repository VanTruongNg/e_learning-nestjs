import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

const globalPrefix = 'api/v1';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Ecommerce API')
    .setDescription('Ecommerce API description')
    .setVersion('1.0')
    .addServer(`http://localhost:3000/${globalPrefix}`)
    .addBearerAuth(
      {
        description: `Please enter token in following format: Bearer <JWT>`,
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header'
      },
      'access-token'
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tryItOutEnabled: true,
    },
  });

  // Áp dụng global interceptor để transform response
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // Áp dụng global filter để xử lý exception
  app.useGlobalFilters(new HttpExceptionFilter());
  
  app.useGlobalPipes(new ValidationPipe())
  app.setGlobalPrefix(globalPrefix);

  await app.listen(3000);
}
bootstrap();
