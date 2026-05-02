import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Global prefix
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors();

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('WMS - Warehouse Management System')
    .setDescription(
      `## API Documentation for WMS Backend
      
### Modules:
- **Auth**: Login & JWT Token
- **Users**: User management (Admin only)
- **Products**: Products, Categories, Units
- **Suppliers & Customers**: Partner management
- **Warehouses & Locations**: Warehouse management
- **Inventory**: Stock levels & transaction history
- **Purchase Orders & Goods Receipts**: Inbound flow
- **Sales Orders & Delivery Notes**: Outbound flow

### Authentication:
All endpoints (except login) require Bearer JWT token.
      `,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('Products', 'Product CRUD')
    .addTag('Categories', 'Product category CRUD')
    .addTag('Units', 'Unit of measure CRUD')
    .addTag('Suppliers', 'Supplier management')
    .addTag('Customers', 'Customer management')
    .addTag('Warehouses', 'Warehouse CRUD')
    .addTag('Locations', 'Warehouse location CRUD')
    .addTag('Inventory', 'Stock levels and transactions')
    .addTag('Purchase Orders', 'Purchase order management')
    .addTag('Goods Receipts', 'Goods receipt (inbound)')
    .addTag('Sales Orders', 'Sales order management')
    .addTag('Delivery Notes', 'Delivery note (outbound)')
    .addTag('Admin - Architecture', 'Database architecture diagnostics (Partitioning, Replication)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 WMS Backend running on: http://localhost:${port}`);
  logger.log(`📖 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
