import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { allowedOrigins } from './common/guards/family-access.guard';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  if (process.env.INTERNAL_LEARNING_PREVIEW==='true' && process.env.FAMILY_LEARNING_ENABLED==='true') throw new Error('Chọn một chế độ: nội bộ hoặc gia đình.');
  app.use((req: Request, res: Response, next: NextFunction) => {res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');next();});

  // 1. CORS Configuration cho Mobile App & Web Client
  app.enableCors({
    origin: allowedOrigins(),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 2. Global Validation Pipe với chuẩn hóa dữ liệu
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 3. Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // 4. Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('The Secret Explorer Academy (KidsSafe AI) API')
    .setDescription('Tài liệu API Tầng Backend Lõi & AI Safety Engine cho Đội Trưởng Milo')
    .setVersion('1.0.0')
    .addTag('ai', 'AI Vision Scanner & Chat với Milo')
    .addTag('learning', 'Lộ trình 10 Vùng Đất & Bài test phản xạ an toàn')
    .addTag('parent', 'Cổng Phụ Huynh & Báo cáo an toàn')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '127.0.0.1');
  logger.log(`======================================================================`);
  logger.log(`🚀 KidsSafe AI Backend is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger API Docs available at: http://localhost:${port}/api/docs`);
  logger.log(`Learning mode: ${process.env.FAMILY_LEARNING_ENABLED==='true'?'family accounts':'internal / closed'}. AI and remote SOS are disabled.`);
  logger.log(`======================================================================`);
}

bootstrap();
