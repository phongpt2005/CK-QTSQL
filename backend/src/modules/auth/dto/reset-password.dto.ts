import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, MinLength, Length } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'user@gmail.com', description: 'Email đăng ký tài khoản (username)' })
  @IsString()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @ApiProperty({ example: '123456', description: 'Mã xác thực 6 chữ số' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Mã xác thực phải có 6 chữ số' })
  code!: string;

  @ApiProperty({ example: 'newpassword123', description: 'Mật khẩu mới (tối thiểu 6 ký tự)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  newPassword!: string;
}
