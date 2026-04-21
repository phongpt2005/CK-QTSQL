import { PrismaService } from '../../common/database/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        username: string;
        role: string | null;
        status: number;
        createdAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        username: string;
        role: string | null;
        status: number;
        createdAt: Date;
    }>;
    create(dto: CreateUserDto): Promise<{
        id: number;
        username: string;
        role: string | null;
        status: number;
        createdAt: Date;
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        id: number;
        username: string;
        role: string | null;
        status: number;
        createdAt: Date;
    }>;
}
