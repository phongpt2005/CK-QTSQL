"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDeliveryNoteDto = exports.DeliveryNoteItemDto = exports.CreateSalesOrderDto = exports.SalesOrderItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class SalesOrderItemDto {
    productId;
    warehouseId;
    locationId;
    quantity;
    unitPrice;
}
exports.SalesOrderItemDto = SalesOrderItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SalesOrderItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Warehouse ID for stock reservation' }),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SalesOrderItemDto.prototype, "warehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Location ID for stock reservation' }),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SalesOrderItemDto.prototype, "locationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10 }),
    (0, class_validator_1.IsInt)({ message: 'Số lượng phải là số nguyên' }),
    (0, class_validator_1.Min)(1, { message: 'Số lượng không được nhỏ hơn 1' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SalesOrderItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 99.99 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SalesOrderItemDto.prototype, "unitPrice", void 0);
class CreateSalesOrderDto {
    customerId;
    orderDate;
    note;
    items;
}
exports.CreateSalesOrderDto = CreateSalesOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Customer ID' }),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSalesOrderDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-19' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateSalesOrderDto.prototype, "orderDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Rush delivery' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSalesOrderDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SalesOrderItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SalesOrderItemDto),
    __metadata("design:type", Array)
], CreateSalesOrderDto.prototype, "items", void 0);
class DeliveryNoteItemDto {
    productId;
    locationId;
    quantity;
}
exports.DeliveryNoteItemDto = DeliveryNoteItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Product ID' }),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], DeliveryNoteItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Location ID to pick from' }),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], DeliveryNoteItemDto.prototype, "locationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10, description: 'Quantity to deliver' }),
    (0, class_validator_1.IsInt)({ message: 'Số lượng phải là số nguyên' }),
    (0, class_validator_1.Min)(1, { message: 'Số lượng không được nhỏ hơn 1' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], DeliveryNoteItemDto.prototype, "quantity", void 0);
class CreateDeliveryNoteDto {
    soId;
    deliveryDate;
    note;
    items;
}
exports.CreateDeliveryNoteDto = CreateDeliveryNoteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Sales Order ID' }),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateDeliveryNoteDto.prototype, "soId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-19' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDeliveryNoteDto.prototype, "deliveryDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Delivered to front gate' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeliveryNoteDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [DeliveryNoteItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DeliveryNoteItemDto),
    __metadata("design:type", Array)
], CreateDeliveryNoteDto.prototype, "items", void 0);
//# sourceMappingURL=index.js.map