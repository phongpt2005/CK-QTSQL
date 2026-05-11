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
            customer: {
                id: number;
                name: string;
                customerCode: string;
            } | null;
            _count: {
                deliveryNotes: number;
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
                totalPrice: import("@prisma/client/runtime/library").Decimal | null;
                soId: number | null;
            })[];
        } & {
            id: number;
            status: string;
            createdAt: Date;
            note: string | null;
            orderDate: Date;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            createdBy: number | null;
            customerId: number | null;
            soCode: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<{
        reservations: ({
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
            status: string | null;
            createdAt: Date;
            warehouseId: number | null;
            productId: number | null;
            referenceType: string | null;
            referenceId: number | null;
            locationId: number | null;
            reservedQty: number;
        })[];
        customer: {
            id: number;
            address: string | null;
            phone: string | null;
            status: number;
            createdAt: Date;
            name: string;
            email: string | null;
            customerCode: string;
            isDeleted: boolean;
        } | null;
        deliveryNotes: ({
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
        id: number;
        status: string;
        createdAt: Date;
        note: string | null;
        orderDate: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        createdBy: number | null;
        customerId: number | null;
        soCode: string;
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
        note: string | null;
        orderDate: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        createdBy: number | null;
        customerId: number | null;
        soCode: string;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
