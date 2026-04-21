import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWarehouseDto {
  @ApiProperty({ example: 'Main Warehouse' })
  @IsString()
  @IsNotEmpty()
  warehouseName!: string;

  @ApiPropertyOptional({ example: '123 Industrial Zone' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '0901234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'John Manager' })
  @IsOptional()
  @IsString()
  managerName?: string;
}

export class UpdateWarehouseDto {
  @ApiPropertyOptional({ example: 'Updated Warehouse Name' })
  @IsOptional()
  @IsString()
  warehouseName?: string;

  @ApiPropertyOptional({ example: '456 New Zone' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '0909876543' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Jane Manager' })
  @IsOptional()
  @IsString()
  managerName?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  status?: number;
}

export class CreateLocationDto {
  @ApiProperty({ example: 1, description: 'Warehouse ID' })
  @IsInt()
  @Type(() => Number)
  warehouseId!: number;

  @ApiProperty({ example: 'A-01-01' })
  @IsString()
  @IsNotEmpty()
  locationCode!: string;

  @ApiPropertyOptional({ example: 'Shelf A, Row 1, Position 1' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  capacity?: number;
}

export class UpdateLocationDto {
  @ApiPropertyOptional({ example: 'A-01-02' })
  @IsOptional()
  @IsString()
  locationCode?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  capacity?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  status?: number;
}
