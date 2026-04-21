import { SalesOrdersService } from '../services/sales-orders.service';
import { CreateSalesOrderDto } from '../dto';
export declare class SalesOrdersController {
    private salesOrdersService;
    constructor(salesOrdersService: SalesOrdersService);
    findAll(page?: string, limit?: string, status?: string): Promise<{
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
            address: string | null;
            phone: string | null;
            email: string | null;
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
}
