import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsInt, IsNumber, IsArray, ValidateNested, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SalesOrderItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Type(() => Number)
  productId!: number;

  @ApiProperty({ example: 1, description: 'Warehouse ID for stock reservation' })
  @IsInt()
  @Type(() => Number)
  warehouseId!: number;

  @ApiProperty({ example: 1, description: 'Location ID for stock reservation' })
  @IsInt()
  @Type(() => Number)
  locationId!: number;

  @ApiProperty({ example: 10 })
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng không được nhỏ hơn 1' })
  @Type(() => Number)
  quantity!: number;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @Type(() => Number)
  unitPrice!: number;
}

export class CreateSalesOrderDto {
  @ApiProperty({ example: 1, description: 'Customer ID' })
  @IsInt()
  @Type(() => Number)
  customerId!: number;

  @ApiProperty({ example: '2026-04-19' })
  @IsDateString()
  orderDate!: string;

  @ApiPropertyOptional({ example: 'Rush delivery' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ type: [SalesOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesOrderItemDto)
  items!: SalesOrderItemDto[];
}

export class DeliveryNoteItemDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @IsInt()
  @Type(() => Number)
  productId!: number;

  @ApiProperty({ example: 1, description: 'Location ID to pick from' })
  @IsInt()
  @Type(() => Number)
  locationId!: number;

  @ApiProperty({ example: 10, description: 'Quantity to deliver' })
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng không được nhỏ hơn 1' })
  @Type(() => Number)
  quantity!: number;
}

export class CreateDeliveryNoteDto {
  @ApiProperty({ example: 1, description: 'Sales Order ID' })
  @IsInt()
  @Type(() => Number)
  soId!: number;

  @ApiProperty({ example: '2026-04-19' })
  @IsDateString()
  deliveryDate!: string;

  @ApiPropertyOptional({ example: 'Delivered to front gate' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ type: [DeliveryNoteItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryNoteItemDto)
  items!: DeliveryNoteItemDto[];
}
