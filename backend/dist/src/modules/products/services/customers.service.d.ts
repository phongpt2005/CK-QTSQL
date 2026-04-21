import { PrismaService } from '../../../common/database/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../dto';
export declare class CustomersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        name: string;
        isDeleted: boolean;
        address: string | null;
        phone: string | null;
        email: string | null;
        customerCode: string;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        name: string;
        isDeleted: boolean;
        address: string | null;
        phone: string | null;
        email: string | null;
        customerCode: string;
    }>;
    create(dto: CreateCustomerDto): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        name: string;
        isDeleted: boolean;
        address: string | null;
        phone: string | null;
        email: string | null;
        customerCode: string;
    }>;
    update(id: number, dto: UpdateCustomerDto): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        name: string;
        isDeleted: boolean;
        address: string | null;
        phone: string | null;
        email: string | null;
        customerCode: string;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
