import { ProductsService } from '../services/products.service';
import { CreateProductDto, UpdateProductDto } from '../dto';
export declare class ProductsController {
    private productsService;
    constructor(productsService: ProductsService);
    findAll(search?: string, categoryId?: string, page?: string, limit?: string): Promise<{
        data: ({
            unit: {
                symbol: string | null;
                id: number;
                unitName: string;
            } | null;
            category: {
                id: number;
                categoryName: string;
            } | null;
        } & {
            id: number;
            status: number;
            createdAt: Date;
            description: string | null;
            updatedAt: Date;
            isDeleted: boolean;
            productCode: string;
            productName: string;
            price: import("@prisma/client/runtime/library").Decimal;
            categoryId: number | null;
            unitId: number | null;
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
            categoryName: string;
            description: string | null;
            updatedAt: Date;
            isDeleted: boolean;
        } | null;
    } & {
        id: number;
        status: number;
        createdAt: Date;
        description: string | null;
        updatedAt: Date;
        isDeleted: boolean;
        productCode: string;
        productName: string;
        price: import("@prisma/client/runtime/library").Decimal;
        categoryId: number | null;
        unitId: number | null;
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
            categoryName: string;
            description: string | null;
            updatedAt: Date;
            isDeleted: boolean;
        } | null;
    } & {
        id: number;
        status: number;
        createdAt: Date;
        description: string | null;
        updatedAt: Date;
        isDeleted: boolean;
        productCode: string;
        productName: string;
        price: import("@prisma/client/runtime/library").Decimal;
        categoryId: number | null;
        unitId: number | null;
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
            categoryName: string;
            description: string | null;
            updatedAt: Date;
            isDeleted: boolean;
        } | null;
    } & {
        id: number;
        status: number;
        createdAt: Date;
        description: string | null;
        updatedAt: Date;
        isDeleted: boolean;
        productCode: string;
        productName: string;
        price: import("@prisma/client/runtime/library").Decimal;
        categoryId: number | null;
        unitId: number | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
