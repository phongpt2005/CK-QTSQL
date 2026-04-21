import { SuppliersService } from '../services/suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from '../dto';
export declare class SuppliersController {
    private suppliersService;
    constructor(suppliersService: SuppliersService);
    findAll(): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        name: string;
        isDeleted: boolean;
        address: string | null;
        phone: string | null;
        supplierCode: string;
        email: string | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        name: string;
        isDeleted: boolean;
        address: string | null;
        phone: string | null;
        supplierCode: string;
        email: string | null;
    }>;
    create(dto: CreateSupplierDto): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        name: string;
        isDeleted: boolean;
        address: string | null;
        phone: string | null;
        supplierCode: string;
        email: string | null;
    }>;
    update(id: number, dto: UpdateSupplierDto): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        name: string;
        isDeleted: boolean;
        address: string | null;
        phone: string | null;
        supplierCode: string;
        email: string | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
