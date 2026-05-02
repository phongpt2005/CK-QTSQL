import { ProductsService } from '../services/products.service';
import { CreateProductDto, UpdateProductDto } from '../dto';
export declare class ProductsController {
    private productsService;
    constructor(productsService: ProductsService);
    findAll(search?: string, categoryId?: string, page?: string, limit?: string): Promise<{
        data: ({
            category: {
                categoryName: string;
                id: number;
            } | null;
            unit: {
                symbol: string | null;
                unitName: string;
                id: number;
            } | null;
        } & {
            description: string | null;
            productCode: string;
            productName: string;
            categoryId: number | null;
            unitId: number | null;
            price: import("@prisma/client/runtime/library").Decimal;
            status: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
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
        category: {
            description: string | null;
            status: number;
            categoryName: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
        } | null;
        unit: {
            symbol: string | null;
            unitName: string;
            id: number;
        } | null;
    } & {
        description: string | null;
        productCode: string;
        productName: string;
        categoryId: number | null;
        unitId: number | null;
        price: import("@prisma/client/runtime/library").Decimal;
        status: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
    }>;
    create(dto: CreateProductDto): Promise<{
        category: {
            description: string | null;
            status: number;
            categoryName: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
        } | null;
        unit: {
            symbol: string | null;
            unitName: string;
            id: number;
        } | null;
    } & {
        description: string | null;
        productCode: string;
        productName: string;
        categoryId: number | null;
        unitId: number | null;
        price: import("@prisma/client/runtime/library").Decimal;
        status: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
    }>;
    update(id: number, dto: UpdateProductDto): Promise<{
        category: {
            description: string | null;
            status: number;
            categoryName: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
        } | null;
        unit: {
            symbol: string | null;
            unitName: string;
            id: number;
        } | null;
    } & {
        description: string | null;
        productCode: string;
        productName: string;
        categoryId: number | null;
        unitId: number | null;
        price: import("@prisma/client/runtime/library").Decimal;
        status: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
