import { PrismaService } from '../../../common/database/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../dto';
export declare class CustomersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        address: string | null;
        phone: string | null;
        status: number;
        createdAt: Date;
        name: string;
        email: string | null;
        customerCode: string;
        isDeleted: boolean;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        address: string | null;
        phone: string | null;
        status: number;
        createdAt: Date;
        name: string;
        email: string | null;
        customerCode: string;
        isDeleted: boolean;
    }>;
    create(dto: CreateCustomerDto): Promise<{
        id: number;
        address: string | null;
        phone: string | null;
        status: number;
        createdAt: Date;
        name: string;
        email: string | null;
        customerCode: string;
        isDeleted: boolean;
    }>;
    update(id: number, dto: UpdateCustomerDto): Promise<{
        id: number;
        address: string | null;
        phone: string | null;
        status: number;
        createdAt: Date;
        name: string;
        email: string | null;
        customerCode: string;
        isDeleted: boolean;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
