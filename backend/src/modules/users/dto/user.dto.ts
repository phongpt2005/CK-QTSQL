import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsIn, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'staff01' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({ example: 'Staff', enum: ['Admin', 'Staff'] })
  @IsOptional()
  @IsString()
  @IsIn(['Admin', 'Staff'])
  role?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'newpassword123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ example: 'Admin', enum: ['Admin', 'Staff'] })
  @IsOptional()
  @IsString()
  @IsIn(['Admin', 'Staff'])
  role?: string;

  @ApiPropertyOptional({ example: 1, description: '1 = active, 0 = inactive' })
  @IsOptional()
  status?: number;
}
