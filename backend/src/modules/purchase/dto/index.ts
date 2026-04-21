import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsInt, IsNumber, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseOrderItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Type(() => Number)
  productId!: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Type(() => Number)
  quantity!: number;

  @ApiProperty({ example: 50.00 })
  @IsNumber()
  @Type(() => Number)
  unitPrice!: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ example: 1, description: 'Supplier ID' })
  @IsInt()
  @Type(() => Number)
  supplierId!: number;

  @ApiProperty({ example: '2026-04-19' })
  @IsDateString()
  orderDate!: string;

  @ApiPropertyOptional({ example: 'Urgent order' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ type: [PurchaseOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items!: PurchaseOrderItemDto[];
}

export class GoodsReceiptItemDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @IsInt()
  @Type(() => Number)
  productId!: number;

  @ApiProperty({ example: 1, description: 'Location ID to store the goods' })
  @IsInt()
  @Type(() => Number)
  locationId!: number;

  @ApiProperty({ example: 50, description: 'Quantity received' })
  @IsInt()
  @Type(() => Number)
  quantity!: number;
}

export class CreateGoodsReceiptDto {
  @ApiProperty({ example: 1, description: 'Purchase Order ID' })
  @IsInt()
  @Type(() => Number)
  poId!: number;

  @ApiProperty({ example: '2026-04-19' })
  @IsDateString()
  receiptDate!: string;

  @ApiPropertyOptional({ example: 'All items in good condition' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ type: [GoodsReceiptItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsReceiptItemDto)
  items!: GoodsReceiptItemDto[];
}
