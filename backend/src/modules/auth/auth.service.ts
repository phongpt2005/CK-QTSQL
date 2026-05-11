import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/database/prisma.service';
import { MailService } from '../../common/mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: loginDto.username },
    });

    if (!user) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
    }

    if (user.status !== 1) {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: registerDto.username },
    });

    if (existingUser) {
      throw new ConflictException('Tên người dùng (Email) đã được sử dụng');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: registerDto.username,
        passwordHash,
        role: 'Staff', // Default role for new registrations
        status: 1,
      },
    });

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  async validateUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.status !== 1) {
      throw new UnauthorizedException('Không tìm thấy người dùng hoặc tài khoản bị vô hiệu hóa');
    }

    return user;
  }

  // ================================================================
  // FORGOT PASSWORD & RESET PASSWORD
  // ================================================================

  /**
   * Generate a random 6-digit verification code
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Step 1: Send verification code to user's email
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    // Find user by email (username)
    const user = await this.prisma.user.findUnique({
      where: { username: dto.email },
    });

    if (!user) {
      throw new BadRequestException('Không tìm thấy tài khoản với email này');
    }

    if (user.status !== 1) {
      throw new BadRequestException('Tài khoản đã bị vô hiệu hóa');
    }

    // Invalidate any existing unused codes for this user
    await this.prisma.passwordReset.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Generate a new 6-digit code
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save the code to DB
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      },
    });

    // Send email
    await this.mailService.sendResetCode(dto.email, code);

    this.logger.log(`Password reset code sent to ${dto.email}`);

    return {
      message: 'Mã xác thực đã được gửi đến email của bạn',
    };
  }

  /**
   * Step 2: Verify code and set new password
   */
  async resetPassword(dto: ResetPasswordDto) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { username: dto.email },
    });

    if (!user) {
      throw new BadRequestException('Không tìm thấy tài khoản với email này');
    }

    // Find the latest valid reset record
    const resetRecord = await this.prisma.passwordReset.findFirst({
      where: {
        userId: user.id,
        code: dto.code,
        used: false,
        expiresAt: {
          gte: new Date(), // not expired
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!resetRecord) {
      throw new BadRequestException(
        'Mã xác thực không hợp lệ hoặc đã hết hạn',
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    // Update user password and mark reset record as used (in a transaction)
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      this.prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ]);

    this.logger.log(`Password reset successful for ${dto.email}`);

    return {
      message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.',
    };
  }
}
