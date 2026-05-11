import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private inventoryService;
    constructor(inventoryService: InventoryService);
    findAll(warehouseId?: string, productId?: string, locationId?: string, page?: string, limit?: string): Promise<{
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
            quantity: number;
            locationId: number | null;
            lastUpdated: Date;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getTransactions(productId?: string, warehouseId?: string, page?: string, limit?: string): Promise<{
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
            transactionType: string | null;
            referenceType: string | null;
            referenceId: number | null;
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
            quantity: number;
            locationId: number | null;
            lastUpdated: Date;
        }[];
    }>;
}
