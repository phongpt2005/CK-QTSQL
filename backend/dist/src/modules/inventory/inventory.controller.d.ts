import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private inventoryService;
    constructor(inventoryService: InventoryService);
    findAll(warehouseId?: string, productId?: string, locationId?: string, page?: string, limit?: string): Promise<{
        data: ({
            warehouse: {
                id: number;
                warehouseName: string;
            } | null;
            location: {
                id: number;
                locationCode: string;
            } | null;
            product: {
                id: number;
                productCode: string;
                productName: string;
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
    getTransactions(productId?: string, warehouseId?: string, page?: string, limit?: string): Promise<{
        data: ({
            warehouse: {
                id: number;
                warehouseName: string;
            } | null;
            product: {
                id: number;
                productCode: string;
                productName: string;
            } | null;
        } & {
            id: number;
            warehouseId: number | null;
            note: string | null;
            productId: number | null;
            quantity: number;
            referenceType: string | null;
            referenceId: number | null;
            transactionType: string | null;
            transactionDate: Date;
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
            warehouse: {
                id: number;
                warehouseName: string;
            } | null;
            location: {
                id: number;
                locationCode: string;
            } | null;
            product: {
                id: number;
                productCode: string;
                productName: string;
            } | null;
            id: number;
            warehouseId: number | null;
            productId: number | null;
            locationId: number | null;
            quantity: number;
            lastUpdated: Date;
        }[];
    }>;
}
