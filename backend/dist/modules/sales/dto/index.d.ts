export declare class SalesOrderItemDto {
    productId: number;
    warehouseId: number;
    locationId: number;
    quantity: number;
    unitPrice: number;
}
export declare class CreateSalesOrderDto {
    customerId: number;
    orderDate: string;
    note?: string;
    items: SalesOrderItemDto[];
}
export declare class DeliveryNoteItemDto {
    productId: number;
    locationId: number;
    quantity: number;
}
export declare class CreateDeliveryNoteDto {
    soId: number;
    deliveryDate: string;
    note?: string;
    items: DeliveryNoteItemDto[];
}
