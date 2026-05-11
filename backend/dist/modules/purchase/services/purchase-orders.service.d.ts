import { PrismaService } from '../../../common/database/prisma.service';
import { CreatePurchaseOrderDto } from '../dto';
export declare class PurchaseOrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query?: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<{
        data: ({
            supplier: {
                id: number;
                name: string;
                supplierCode: string;
            } | null;
            _count: {
                goodsReceipts: number;
            };
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
            note: string | null;
            supplierId: number | null;
            orderDate: Date;
            poCode: string;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
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
        supplier: {
            id: number;
            address: string | null;
            phone: string | null;
            status: number;
            createdAt: Date;
            name: string;
            email: string | null;
            supplierCode: string;
            isDeleted: boolean;
        } | null;
        goodsReceipts: ({
            details: ({
                product: {
                    id: number;
                    productCode: string;
                    productName: string;
                } | null;
                location: {
                    id: number;
                    locationCode: string;
                } | null;
            } & {
                id: number;
                productId: number | null;
                quantity: number;
                locationId: number | null;
                receiptId: number | null;
            })[];
        } & {
            id: number;
            status: string | null;
            createdAt: Date;
            note: string | null;
            poId: number | null;
            receiptDate: Date;
            createdBy: number | null;
            receiptCode: string;
        })[];
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
        note: string | null;
        supplierId: number | null;
        orderDate: Date;
        poCode: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
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
        note: string | null;
        supplierId: number | null;
        orderDate: Date;
        poCode: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        createdBy: number | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
