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
exports.UpdateLocationDto = exports.CreateLocationDto = exports.UpdateWarehouseDto = exports.CreateWarehouseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateWarehouseDto {
    warehouseName;
    address;
    phone;
    managerName;
}
exports.CreateWarehouseDto = CreateWarehouseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Main Warehouse' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateWarehouseDto.prototype, "warehouseName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '123 Industrial Zone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWarehouseDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '0901234567' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWarehouseDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'John Manager' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWarehouseDto.prototype, "managerName", void 0);
class UpdateWarehouseDto {
    warehouseName;
    address;
    phone;
    managerName;
    status;
}
exports.UpdateWarehouseDto = UpdateWarehouseDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Updated Warehouse Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWarehouseDto.prototype, "warehouseName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '456 New Zone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWarehouseDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '0909876543' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWarehouseDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Jane Manager' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWarehouseDto.prototype, "managerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateWarehouseDto.prototype, "status", void 0);
class CreateLocationDto {
    warehouseId;
    locationCode;
    description;
    capacity;
}
exports.CreateLocationDto = CreateLocationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Warehouse ID' }),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateLocationDto.prototype, "warehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'A-01-01' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "locationCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Shelf A, Row 1, Position 1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateLocationDto.prototype, "capacity", void 0);
class UpdateLocationDto {
    locationCode;
    description;
    capacity;
    status;
}
exports.UpdateLocationDto = UpdateLocationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'A-01-02' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLocationDto.prototype, "locationCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Updated description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLocationDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 200 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateLocationDto.prototype, "capacity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateLocationDto.prototype, "status", void 0);
//# sourceMappingURL=index.js.map