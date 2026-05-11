import { CustomersService } from '../services/customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../dto';
export declare class CustomersController {
    private customersService;
    constructor(customersService: CustomersService);
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
