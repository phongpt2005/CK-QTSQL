"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = new common_1.Logger('Bootstrap');
    app.setGlobalPrefix('api');
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('WMS - Warehouse Management System')
        .setDescription(`## API Documentation for WMS Backend
      
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
      `)
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
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
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
//# sourceMappingURL=main.js.map