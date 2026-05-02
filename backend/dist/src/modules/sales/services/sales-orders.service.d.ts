import { PrismaService } from '../../../common/database/prisma.service';
import { InventoryService } from '../../inventory/inventory.service';
import { CreateSalesOrderDto } from '../dto';
export declare class SalesOrdersService {
    private prisma;
    private inventoryService;
    private readonly logger;
    constructor(prisma: PrismaService, inventoryService: InventoryService);
    findAll(query?: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<{
        data: ({
            _count: {
                deliveryNotes: number;
            };
            customer: {
                id: number;
                name: string;
                customerCode: string;
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
                totalPrice: import("@prisma/client/runtime/library").Decimal | null;
                soId: number | null;
            })[];
        } & {
            id: number;
            status: string;
            createdAt: Date;
            orderDate: Date;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            note: string | null;
            createdBy: number | null;
            soCode: string;
            customerId: number | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<{
        deliveryNotes: ({
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
                deliveryId: number | null;
            })[];
        } & {
            id: number;
            status: string | null;
            createdAt: Date;
            note: string | null;
            createdBy: number | null;
            soId: number | null;
            deliveryDate: Date;
            deliveryCode: string;
        })[];
        customer: {
            id: number;
            status: number;
            createdAt: Date;
            name: string;
            isDeleted: boolean;
            phone: string | null;
            email: string | null;
            address: string | null;
            customerCode: string;
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
            totalPrice: import("@prisma/client/runtime/library").Decimal | null;
            soId: number | null;
        })[];
    } & {
        id: number;
        status: string;
        createdAt: Date;
        orderDate: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        note: string | null;
        createdBy: number | null;
        soCode: string;
        customerId: number | null;
    }>;
    create(dto: CreateSalesOrderDto, userId: number): Promise<{
        customer: {
            id: number;
            name: string;
            customerCode: string;
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
            totalPrice: import("@prisma/client/runtime/library").Decimal | null;
            soId: number | null;
        })[];
    } & {
        id: number;
        status: string;
        createdAt: Date;
        orderDate: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        note: string | null;
        createdBy: number | null;
        soCode: string;
        customerId: number | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
