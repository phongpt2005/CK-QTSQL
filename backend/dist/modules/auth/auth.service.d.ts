import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/database/prisma.service';
import { MailService } from '../../common/mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private mailService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, mailService: MailService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: number;
            username: string;
            role: string | null;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: number;
            username: string;
            role: string | null;
        };
    }>;
    validateUser(userId: number): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        username: string;
        passwordHash: string;
        role: string | null;
    }>;
    private generateCode;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
