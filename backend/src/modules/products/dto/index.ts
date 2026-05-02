import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsInt, Matches, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'SP001' })
  @IsString()
  @IsNotEmpty()
  productCode!: string;

  @ApiProperty({ example: 'Widget A' })
  @IsString()
  @IsNotEmpty()
  productName!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  unitId?: number;

  @ApiPropertyOptional({ example: 99.99 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ example: 'Product description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Widget A Updated' })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  unitId?: number;

  @ApiPropertyOptional({ example: 149.99 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  status?: number;
}

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics' })
  @IsString()
  @IsNotEmpty()
  categoryName!: string;

  @ApiPropertyOptional({ example: 'Electronic devices and components' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Consumer Electronics' })
  @IsOptional()
  @IsString()
  categoryName?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  status?: number;
}

export class CreateUnitDto {
  @ApiProperty({ example: 'Kilogram' })
  @IsString()
  @IsNotEmpty()
  unitName!: string;

  @ApiPropertyOptional({ example: 'kg' })
  @IsOptional()
  @IsString()
  symbol?: string;
}

export class UpdateUnitDto {
  @ApiPropertyOptional({ example: 'Gram' })
  @IsOptional()
  @IsString()
  unitName?: string;

  @ApiPropertyOptional({ example: 'g' })
  @IsOptional()
  @IsString()
  symbol?: string;
}

export class CreateSupplierDto {
  @ApiProperty({ example: 'SUP001' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^SUP/, { message: 'Mã nhà cung cấp phải bắt đầu bằng SUP' })
  supplierCode!: string;

  @ApiProperty({ example: 'ACME Corp' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: '0901234567' })
  @IsOptional()
  @IsString()
  @Matches(/^0\d{9}$/, { message: 'SĐT phải bắt đầu bằng số 0 và có đúng 10 chữ số' })
  phone?: string;

  @ApiPropertyOptional({ example: 'acme@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email?: string;

  @ApiPropertyOptional({ example: '123 Main St' })
  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateSupplierDto {
  @ApiPropertyOptional({ example: 'ACME Corp Updated' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '0909876543' })
  @IsOptional()
  @IsString()
  @Matches(/^0\d{9}$/, { message: 'SĐT phải bắt đầu bằng số 0 và có đúng 10 chữ số' })
  phone?: string;

  @ApiPropertyOptional({ example: 'new@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email?: string;

  @ApiPropertyOptional({ example: '456 New St' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  status?: number;
}

export class CreateCustomerDto {
  @ApiProperty({ example: 'CUS001' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^CUS/, { message: 'Mã khách hàng phải bắt đầu bằng CUS' })
  customerCode!: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: '0901234567' })
  @IsOptional()
  @IsString()
  @Matches(/^0\d{9}$/, { message: 'SĐT phải bắt đầu bằng số 0 và có đúng 10 chữ số' })
  phone?: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email?: string;

  @ApiPropertyOptional({ example: '789 Customer Blvd' })
  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '0909876543' })
  @IsOptional()
  @IsString()
  @Matches(/^0\d{9}$/, { message: 'SĐT phải bắt đầu bằng số 0 và có đúng 10 chữ số' })
  phone?: string;

  @ApiPropertyOptional({ example: 'jane@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email?: string;

  @ApiPropertyOptional({ example: '321 Updated Blvd' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  status?: number;
}
