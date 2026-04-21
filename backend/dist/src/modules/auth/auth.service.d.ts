import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/database/prisma.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: number;
            username: string;
            role: string | null;
        };
    }>;
    validateUser(userId: number): Promise<{
        id: number;
        username: string;
        passwordHash: string;
        role: string | null;
        status: number;
        createdAt: Date;
    }>;
}
