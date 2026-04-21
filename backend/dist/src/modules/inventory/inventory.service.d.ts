import { PrismaService } from '../../common/database/prisma.service';
import { Prisma } from '@prisma/client';
import { QueryInventoryDto } from './dto';
export declare class InventoryService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(query: QueryInventoryDto): Promise<{
        data: ({
            product: {
                id: number;
                productCode: string;
                productName: string;
            } | null;
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
            locationId: number | null;
            quantity: number;
            lastUpdated: Date;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findByProduct(productId: number): Promise<{
        productId: number;
        totalStock: number;
        totalReserved: number;
        totalAvailable: number;
        details: {
            reservedQty: number;
            availableQty: number;
            product: {
                id: number;
                productCode: string;
                productName: string;
            } | null;
            warehouse: {
                id: number;
                warehouseName: string;
            } | null;
            location: {
                id: number;
                locationCode: string;
            } | null;
            id: number;
            warehouseId: number | null;
            productId: number | null;
            locationId: number | null;
            quantity: number;
            lastUpdated: Date;
        }[];
    }>;
    getTransactions(query: {
        productId?: number;
        warehouseId?: number;
        page?: number;
        limit?: number;
    }): Promise<{
        data: ({
            product: {
                id: number;
                productCode: string;
                productName: string;
            } | null;
            warehouse: {
                id: number;
                warehouseName: string;
            } | null;
        } & {
            id: number;
            warehouseId: number | null;
            productId: number | null;
            quantity: number;
            referenceType: string | null;
            referenceId: number | null;
            transactionType: string | null;
            transactionDate: Date;
            note: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    increaseStock(tx: Prisma.TransactionClient, productId: number, warehouseId: number, locationId: number, qty: number, refType: string, refId: number, note?: string): Promise<void>;
    decreaseStock(tx: Prisma.TransactionClient, productId: number, warehouseId: number, locationId: number, qty: number, refType: string, refId: number, note?: string): Promise<void>;
    getAvailableStock(tx: Prisma.TransactionClient, productId: number, warehouseId: number, locationId: number): Promise<number>;
}
