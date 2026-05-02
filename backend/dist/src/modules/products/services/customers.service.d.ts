import { PrismaService } from '../../../common/database/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../dto';
export declare class CustomersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        status: number;
        name: string;
        phone: string | null;
        email: string | null;
        address: string | null;
        customerCode: string;
        id: number;
        createdAt: Date;
        isDeleted: boolean;
    }[]>;
    findOne(id: number): Promise<{
        status: number;
        name: string;
        phone: string | null;
        email: string | null;
        address: string | null;
        customerCode: string;
        id: number;
        createdAt: Date;
        isDeleted: boolean;
    }>;
    create(dto: CreateCustomerDto): Promise<{
        status: number;
        name: string;
        phone: string | null;
        email: string | null;
        address: string | null;
        customerCode: string;
        id: number;
        createdAt: Date;
        isDeleted: boolean;
    }>;
    update(id: number, dto: UpdateCustomerDto): Promise<{
        status: number;
        name: string;
        phone: string | null;
        email: string | null;
        address: string | null;
        customerCode: string;
        id: number;
        createdAt: Date;
        isDeleted: boolean;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
