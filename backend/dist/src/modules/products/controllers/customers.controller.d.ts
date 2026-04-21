import { CustomersService } from '../services/customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../dto';
export declare class CustomersController {
    private customersService;
    constructor(customersService: CustomersService);
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
