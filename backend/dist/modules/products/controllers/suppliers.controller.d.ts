import { SuppliersService } from '../services/suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from '../dto';
export declare class SuppliersController {
    private suppliersService;
    constructor(suppliersService: SuppliersService);
    findAll(): Promise<{
        id: number;
        address: string | null;
        phone: string | null;
        status: number;
        createdAt: Date;
        name: string;
        email: string | null;
        supplierCode: string;
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
        supplierCode: string;
        isDeleted: boolean;
    }>;
    create(dto: CreateSupplierDto): Promise<{
        id: number;
        address: string | null;
        phone: string | null;
        status: number;
        createdAt: Date;
        name: string;
        email: string | null;
        supplierCode: string;
        isDeleted: boolean;
    }>;
    update(id: number, dto: UpdateSupplierDto): Promise<{
        id: number;
        address: string | null;
        phone: string | null;
        status: number;
        createdAt: Date;
        name: string;
        email: string | null;
        supplierCode: string;
        isDeleted: boolean;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
