import { PrismaService } from '../../../common/database/prisma.service';
import { CreateProductDto, UpdateProductDto } from '../dto';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query?: {
        search?: string;
        categoryId?: number;
        page?: number;
        limit?: number;
    }): Promise<{
        data: ({
            unit: {
                symbol: string | null;
                id: number;
                unitName: string;
            } | null;
            inventories: ({
                warehouse: {
                    id: number;
                    warehouseName: string;
                } | null;
                location: {
                    id: number;
                    locationCode: string;
                } | null;
            } & {
                id: number;
                warehouseId: number | null;
                productId: number | null;
                quantity: number;
                locationId: number | null;
                lastUpdated: Date;
            })[];
            category: {
                id: number;
                categoryName: string;
            } | null;
        } & {
            id: number;
            status: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            productCode: string;
            productName: string;
            categoryId: number | null;
            unitId: number | null;
            price: import("@prisma/client/runtime/library").Decimal;
            isDeleted: boolean;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<{
        unit: {
            symbol: string | null;
            id: number;
            unitName: string;
        } | null;
        category: {
            id: number;
            status: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            categoryName: string;
            isDeleted: boolean;
        } | null;
    } & {
        id: number;
        status: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        productCode: string;
        productName: string;
        categoryId: number | null;
        unitId: number | null;
        price: import("@prisma/client/runtime/library").Decimal;
        isDeleted: boolean;
    }>;
    create(dto: CreateProductDto): Promise<{
        unit: {
            symbol: string | null;
            id: number;
            unitName: string;
        } | null;
        category: {
            id: number;
            status: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            categoryName: string;
            isDeleted: boolean;
        } | null;
    } & {
        id: number;
        status: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        productCode: string;
        productName: string;
        categoryId: number | null;
        unitId: number | null;
        price: import("@prisma/client/runtime/library").Decimal;
        isDeleted: boolean;
    }>;
    update(id: number, dto: UpdateProductDto): Promise<{
        unit: {
            symbol: string | null;
            id: number;
            unitName: string;
        } | null;
        category: {
            id: number;
            status: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            categoryName: string;
            isDeleted: boolean;
        } | null;
    } & {
        id: number;
        status: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        productCode: string;
        productName: string;
        categoryId: number | null;
        unitId: number | null;
        price: import("@prisma/client/runtime/library").Decimal;
        isDeleted: boolean;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
