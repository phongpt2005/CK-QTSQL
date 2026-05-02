import { PurchaseOrdersService } from '../services/purchase-orders.service';
import { CreatePurchaseOrderDto } from '../dto';
export declare class PurchaseOrdersController {
    private purchaseOrdersService;
    constructor(purchaseOrdersService: PurchaseOrdersService);
    findAll(page?: string, limit?: string, status?: string): Promise<{
        data: ({
            _count: {
                goodsReceipts: number;
            };
            supplier: {
                id: number;
                name: string;
                supplierCode: string;
            } | null;
            createdByUser: {
                id: number;
                username: string;
            } | null;
            details: ({
                product: {
                    id: number;
                    productCode: string;
                    productName: string;
                } | null;
            } & {
                id: number;
                productId: number | null;
                quantity: number;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                poId: number | null;
                totalPrice: import("@prisma/client/runtime/library").Decimal | null;
            })[];
        } & {
            id: number;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            poCode: string;
            supplierId: number | null;
            orderDate: Date;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            note: string | null;
            createdBy: number | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<{
        goodsReceipts: ({
            details: ({
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
                productId: number | null;
                locationId: number | null;
                quantity: number;
                receiptId: number | null;
            })[];
        } & {
            id: number;
            status: string | null;
            createdAt: Date;
            note: string | null;
            createdBy: number | null;
            poId: number | null;
            receiptDate: Date;
            receiptCode: string;
        })[];
        supplier: {
            id: number;
            status: number;
            createdAt: Date;
            name: string;
            isDeleted: boolean;
            supplierCode: string;
            phone: string | null;
            email: string | null;
            address: string | null;
        } | null;
        createdByUser: {
            id: number;
            username: string;
        } | null;
        details: ({
            product: {
                id: number;
                productCode: string;
                productName: string;
            } | null;
        } & {
            id: number;
            productId: number | null;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            poId: number | null;
            totalPrice: import("@prisma/client/runtime/library").Decimal | null;
        })[];
    } & {
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        poCode: string;
        supplierId: number | null;
        orderDate: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        note: string | null;
        createdBy: number | null;
    }>;
    create(dto: CreatePurchaseOrderDto, userId: number): Promise<{
        supplier: {
            id: number;
            name: string;
            supplierCode: string;
        } | null;
        details: ({
            product: {
                id: number;
                productCode: string;
                productName: string;
            } | null;
        } & {
            id: number;
            productId: number | null;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            poId: number | null;
            totalPrice: import("@prisma/client/runtime/library").Decimal | null;
        })[];
    } & {
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        poCode: string;
        supplierId: number | null;
        orderDate: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        note: string | null;
        createdBy: number | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
