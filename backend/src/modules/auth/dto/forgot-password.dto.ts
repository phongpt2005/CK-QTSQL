import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@gmail.com', description: 'Email đăng ký tài khoản (username)' })
  @IsString()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;
}
