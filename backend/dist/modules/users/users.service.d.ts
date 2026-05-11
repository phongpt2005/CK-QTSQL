import { PrismaService } from '../../common/database/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        username: string;
        role: string | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        username: string;
        role: string | null;
    }>;
    create(dto: CreateUserDto): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        username: string;
        role: string | null;
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        username: string;
        role: string | null;
    }>;
}
