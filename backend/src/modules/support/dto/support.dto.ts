import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTicketDto {
  @IsString({ message: 'Chủ đề phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Chủ đề không được để trống' })
  subject: string;

  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  description: string;
}

export class UpdateStatusDto {
  @IsString({ message: 'Trạng thái phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  status: string;
}
