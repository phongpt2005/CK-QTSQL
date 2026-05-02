import { SuppliersService } from '../services/suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from '../dto';
export declare class SuppliersController {
    private suppliersService;
    constructor(suppliersService: SuppliersService);
    findAll(): Promise<{
        status: number;
        supplierCode: string;
        name: string;
        phone: string | null;
        email: string | null;
        address: string | null;
        id: number;
        createdAt: Date;
        isDeleted: boolean;
    }[]>;
    findOne(id: number): Promise<{
        status: number;
        supplierCode: string;
        name: string;
        phone: string | null;
        email: string | null;
        address: string | null;
        id: number;
        createdAt: Date;
        isDeleted: boolean;
    }>;
    create(dto: CreateSupplierDto): Promise<{
        status: number;
        supplierCode: string;
        name: string;
        phone: string | null;
        email: string | null;
        address: string | null;
        id: number;
        createdAt: Date;
        isDeleted: boolean;
    }>;
    update(id: number, dto: UpdateSupplierDto): Promise<{
        status: number;
        supplierCode: string;
        name: string;
        phone: string | null;
        email: string | null;
        address: string | null;
        id: number;
        createdAt: Date;
        isDeleted: boolean;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
